const express = require("express");
const router = express.Router();
const { upload, partial, download, getSize } = require("../services/minio");
const pg = require("../services/pgService");
const checkRole = require("../middlewares/is-role.middleware");
const { Role, DraftUserRole } = require("../constants");

router.get("/", checkRole([Role.USER]), async (req, res) => {
  if (!req.user) return res.send([]);

  const { user_id, role } = req.user;
  let query = "";
  let params = [];

  if (role === Role.SYSTEM_ADMIN) {
    // SYSTEM_ADMIN: Show all drafts without any restrictions
    query = `
      SELECT d.*, u.name as user_name
      FROM drafts d
      JOIN users u ON u.user_id = d.user_id
    `;
  } else{
    // Other roles (USER): Show only drafts shared with this user
    query = `
      SELECT d.*, u.name as user_name, du.role as draft_user_role
      FROM drafts d
      JOIN users u ON u.user_id = d.user_id
      JOIN drafts_users du ON du.draft_id = d.draft_id
      WHERE du.user_id = $1
    `;
    params.push(user_id);
  }

  const drafts = await pg.exec("any", query, params);
  return res.send(drafts);
});

router.post("/", checkRole([]), async (req, res) => {
  
  const { user_id, name } = req.user;
  const draft = await pg.exec(
    "one",
    "INSERT INTO drafts(user_id, setting, created_on, updated_on) values($1, $2, current_timestamp, current_timestamp) RETURNING *",
    [
      user_id,
      {
        ...req.body,
      },
    ]
  );
  return res.send({ ...draft, user_name: name });
});

router.put("/:draft_id", checkRole([Role.USER]), async (req, res) => {
 
  const old = await pg.exec(
    "one",
    "SELECT setting FROM drafts WHERE draft_id = $1",
    [req.params.draft_id]
  );
  const draft = await pg.exec(
    "one",
    "UPDATE drafts SET setting = $2 WHERE draft_id = $1 RETURNING *",
    [
      req.params.draft_id,
      {
        ...old.setting,
        ...req.body,
      },
    ]
  );
  return res.send(draft);
});

router.delete("/:draft_id", checkRole([Role.USER]), async (req, res) => {
  
  const deleted = await pg.exec(
    "oneOrNone",
    "DELETE FROM drafts WHERE draft_id = $1 RETURNING *",
    [`${req.params.draft_id}`]
  );
  return res.send(deleted);
});

router.get("/video/:name", async (req, res) => {
  console.log("did this hit?");
  const size = await getSize({ Key: req.params.name });
  console.log("got size?");
  const rangeHeader = req.headers.range;
  console.log("got range?");
  if (!rangeHeader) {
    console.log("no range? this may be a pic");
    const file = await download({ Key: req.params.name });
    console.log("got file, piping");
    if (!file.error) file.pipe(res);
    else return res.send(file);
  } else {
    console.log("success got range");
    const splittedRange = rangeHeader.replace(/bytes=/, "").split("-");
    const start = parseInt(splittedRange[0]);
    console.log("it there spliited range [1] ?");
    console.log(splittedRange[0]);
    console.log("whats the end?");
    const end = Math.min(
      splittedRange[1] ? parseInt(splittedRange[1], 10) : start + 10 ** 6,
      size - 1
    );
    console.log(end);
    const contentLength = end - start + 1;
    console.log(start);
    console.log(end);

    // create and set response headers
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };
    const file = await partial({
      Key: req.params.name,
      Range: `bytes=${start}-${end}`,
    });
    if (!file.error) {
      res.writeHead(206, headers);
      file.pipe(res);
    } else return res.send(file);
    // if (!file.pipe) {
    //     return res.send('')
    // } else {
    //     file.pipe(res)
    // }
  }
});

router.post("/video/:draft_id", async (req, res) => {
  if (!req.user) return res.send({ error: "user not found" });
  const uploads = await Promise.all(
    JSON.parse(req.body.files).map((file) =>
      upload({ Key: file.name, Body: Buffer.from(file.data) })
    )
  );
  const old = await pg.exec(
    "one",
    "SELECT setting FROM drafts WHERE draft_id = $1",
    [req.params.draft_id]
  );
  const draft = await pg.exec(
    "one",
    "UPDATE drafts set setting = $2, updated_on = current_timestamp WHERE draft_id = $1 RETURNING draft_id,setting",
    [
      req.params.draft_id,
      { ...old.setting, videos: [...old.setting.videos, ...uploads] },
    ]
  );
  return res.send(draft);
});

router.delete("/video/:draft_id/:index", async (req, res) => {
  if (!req.user) return res.send({ error: "user not found" });
  const old = await pg.exec(
    "one",
    "SELECT setting FROM drafts WHERE draft_id = $1",
    [req.params.draft_id]
  );
  const draft = await pg.exec(
    "one",
    "UPDATE drafts set setting = $2, updated_on = current_timestamp WHERE draft_id = $1 RETURNING draft_id,setting",
    [
      req.params.draft_id,
      {
        ...old.setting,
        videos: old.setting.videos.filter(
          (v, i) => i !== parseInt(req.params.index, 10)
        ),
      },
    ]
  );
  return res.send(draft);
});

router.get('/:draft_id/members', checkRole([Role.USER]), async (req, res) => {
  const { role } = req.user;

  let query = "";
  let params = [req.params.draft_id];

  if (role === Role.SYSTEM_ADMIN) {
    // SYSTEM_ADMIN: Show only PROJECT_ADMIN members
    query = `
      SELECT u.user_id, u.name, u.email, u.role, du.created_on, du.role as draft_user_role, du.updated_on 
      FROM drafts_users du 
      JOIN users u ON du.user_id = u.user_id 
      WHERE du.draft_id = $1 AND du.role = '${DraftUserRole.PROJECT_ADMIN}'
    `;
  } else {
    // USER role: Show only PROJECT_DESIGNER or VISITOR members
    query = `
      SELECT u.user_id, u.name, u.email, u.role, du.created_on, du.role as draft_user_role, du.updated_on 
      FROM drafts_users du 
      JOIN users u ON du.user_id = u.user_id 
      WHERE du.draft_id = $1 AND du.role IN ('${DraftUserRole.PROJECT_DESIGNER}', '${DraftUserRole.VISITOR}')
    `;
  }

  const members = await pg.exec("any", query, params);
  return res.send(members);
});

router.post('/:draft_id/members', checkRole([Role.USER]), async (req, res) => {
  if (!req.user) return res.send({ error: "user not found" });
  const { user_id } = req.user;
  const { email, role } = req.body;
  const user = await pg.exec(
    "one",
    "SELECT user_id FROM users WHERE email = $1",
    [email]
  );
  if (!user) return res.send({ error: "user not found" });

  const member = await pg.exec(
    "one",
    "INSERT INTO drafts_users(draft_id, user_id, role, created_by, created_on, updated_on) VALUES($1, $2, $3, $4, current_timestamp, current_timestamp) RETURNING *",
    [req.params.draft_id, user.user_id, role, user_id]
  );
  return res.send(member);
});

router.delete('/:draft_id/members/:user_id', checkRole([Role.USER]), async (req, res) => {
  if (!req.params.user_id) return res.send({ error: "user not found" });

  const deleted = await pg.exec(
    "oneOrNone",
    "DELETE FROM drafts_users WHERE draft_id = $1 AND user_id = $2 RETURNING *",
    [req.params.draft_id, req.params.user_id]
  );
  return res.send(deleted);
});

module.exports = router;

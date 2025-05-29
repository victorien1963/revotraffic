const Role = Object.freeze({
  SYSTEM_ADMIN: "SYSTEM_ADMIN",
  USER: "USER",
});

const DraftUserRole = Object.freeze({
  PROJECT_ADMIN: "PROJECT_ADMIN",
  PROJECT_DESIGNER: "PROJECT_DESIGNER",
  VISITOR: "VISITOR",
});

module.exports = { Role, DraftUserRole };

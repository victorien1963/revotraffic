const apiServices = require('./apiService')

const upload = async (video) => {
    const res = await apiServices.send({
        url: `${process.env.VIDEO_JOB_API}/uplode_video`,
        method: 'post',
        data: video,
        params: {
            camera_no: 106,
        },
      })
    console.log(res)
    return res
}

const start = async (video_id) => {
    const res = await apiServices.send({
        url: `${process.env.VIDEO_JOB_API}/add_task`,
        method: 'get',
        params: {
            video_id,
        },
      })
    console.log(res)
    return res
}

const getResult = async (task_id) => {
    const res = await apiServices.send({
        url: `${process.env.VIDEO_JOB_API}/get_result`,
        method: 'get',
        params: {
            task_id,
        },
      })
    return res
}

const getResultXlsx = async (task_id) => {
    const res = await apiServices.send({
        url: `${process.env.VIDEO_JOB_API}/get_result_excel`,
        method: 'get',
        params: {
            task_id,
        },
        responseType: 'arraybuffer'
      })
    return res
}

module.exports = {
    upload,
    start,
    getResult,
    getResultXlsx,
}
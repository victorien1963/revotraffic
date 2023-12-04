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

const start = async (params) => {
    const res = await apiServices.send({
        url: `${process.env.VIDEO_JOB_API}/add_task`,
        method: 'get',
        params: {
            bucket_name: 'revotraffic',
            camera_no: '106',
            ...params,
            object_name: '1700819033575_test_video.mp4' || params.name,
        },
      })
    return res
}

const getTaskStatus = async (task_id) => {
    const res = await apiServices.send({
        url: `${process.env.VIDEO_JOB_API}/get_task`,
        method: 'get',
        params: {
            task_id,
        },
      })
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

const getResultCarSpacing = async (task_id) => {
    const res = await apiServices.send({
        url: `${process.env.VIDEO_JOB_API}/get_result_car_spacing`,
        method: 'get',
        params: {
            task_id,
        },
        // responseType: 'arraybuffer'
      })
    return res
}

const getResultSpeed = async (task_id) => {
    const res = await apiServices.send({
        url: `${process.env.VIDEO_JOB_API}/get_result_speed`,
        method: 'get',
        params: {
            task_id,
        },
        // responseType: 'arraybuffer'
      })
    return res
}

const getResultVideo = async (task_id) => {
    const res = await apiServices.send({
        url: `${process.env.VIDEO_JOB_API}/get_result_video`,
        method: 'get',
        params: {
            task_id,
        },
        // responseType: 'arraybuffer'
      })
    return res
}

const getResultVideoWarp = async (task_id) => {
    const res = await apiServices.send({
        url: `${process.env.VIDEO_JOB_API}/get_result_video_warp`,
        method: 'get',
        params: {
            task_id,
        },
        // responseType: 'arraybuffer'
      })
    return res
}

module.exports = {
    upload,
    start,
    getTaskStatus,
    getResult,
    getResultXlsx,
    getResultCarSpacing,
    getResultSpeed,
    getResultVideo,
    getResultVideoWarp,
}
const express = require('express')
const router = express.Router()

const apiService = require('../services/apiService')

const defaultSetting = {
    "inpxFilePath": "C:\\Users\\leo_1\\Documents\\GitHub\\VISSIM_test_2023_v8\\data\\1120210-V8\\01-績效指標(路口、路段分開)\\05_(0621-0715 )(7a&8)\\01_交通量_0712_0700-0800\\綠線模型(7a&8)_0712_0700.inpx",
    "layxFilePath": "C:\\Users\\leo_1\\Documents\\GitHub\\VISSIM_test_2023_v8\\data\\1120210-V8\\01-績效指標(路口、路段分開)\\05_(0621-0715 )(7a&8)\\01_交通量_0712_0700-0800\\綠線模型(7a&8)_0712_0700.layx",
    "learning_rate": 0.00003,
    "batch_size": 32,
    "gamma": 0.8,
    "memory_max_size": 20000,
    "use_cuda": true,
    "num_episodes": 100,
    "quickMode": 1,
    "num_intersections": 4,
    "vissim_one_round_simulationTime": 3900,
    "YELLOW_TIME": 30,
    "RED_TIME": 30,
    "train_stepGap": 10,
    "eval_stepGap": 10,
    "sc_names": ["G11-2", "G11-1", "G10.5", "G10"],
    "sc_ids": [3, 2, 4, 1],
    "sigActions": [
      [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
      [[1, 0, 0, 0], [1, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]],
      [[1, 0], [0, 1]],
      [[1, 0], [0, 1]]
    ],
    "sigActionsColdTimes": [
      [200, 15, 100],
      [10, 600, 30, 100],
      [200, 100],
      [200, 100]
    ],
    "vissim_in_lane_name": [
      [
        [["57-1", "57-2", "54-1", "54-2", "10073-1", "10010-1", "53-1", "53-2"]],
        [["52-1", "52-2", "52-3", "10072-1", "10074-1", "10074-2", "10076-1", "51-1", "51-2", "51-3"]],
        [["60-1", "60-2", "10082-1", "10082-2", "59-1", "59-2"]],
        [["56-1", "56-2", "56-3", "10105-1", "10109-1", "10109-2", "10084-1", "63-1", "63-2", "63-3"]]
      ],
      [
        [["10053-1", "10054-1", "38-1", "38-2", "37-1", "37-2"]],
        [["2-1", "2-2", "2-3", "10001-1", "10002-1", "10048-1", "1-1", "1-2"]],
        [["41-1"]],
        [["43-1", "43-2", "10064-1", "10065-1", "42-1", "42-2"]]
      ],
      [
        [["75-1"]],
        [["28-1", "29-1", "30-1", "10040-1", "10041-1", "10042-1", "86-1", "86-2", "86-3"]],
        [["77-1"]],
        [["84-1","85-1", "10113-1", "10114-1", "87-1", "87-2"]]
      ],
      [
        [["25-1", "25-2", "10006-1", "10006-2", "10015-1", "24-1", "24-2", "24-3"]],
        [["6-1", "6-2", "7-1", "10005-1", "5-1", "5-2"]],
        [["21-1", "21-2", "10023-1", "10024-1", "32-1", "10077-1", "10078-1", "10079-1", "20-1", "20-2", "20-3"]],
        [["16-1", "16-2", "10012-1", "10012-2", "15-1", "15-2"]]
      ]
    ],
    "vissim_out_lane_name": [
      [
        [["46-1"]],
        [["50-1", "50-2"]],
        [["45-1"]],
        [["48-1", "48-2"]]
      ],
      [
        [["4-1"]],
        [["10055-1", "10055-2", "40-1", "40-2"]],
        [["35-1", "35-2"]],
        [["3-1", "3-2", "3-3", "10138-1", "10138-2", "10138-3"]]
      ],
      [
        [["76-1"]],
        [["83-1", "83-2", "10137-1", "10137-2"]],
        [["78-1"]],
        [["82-1", "82-2", "10136-1", "10136-2"]]
      ],
      [
        [["11-1", "11-2", "10007-1", "10007-2", "12-1", "12-2", "10008-1", "10008-2", "10009-1"]],
        [["18-1", "18-2", "8-1", "10019-1", "10019-2", "10020-1", "10020-2", "33-1", "34-1"]],
        [["9-1", "9-2", "9-3", "10011-1", "10011-2", "10011-3", "17-1", "17-2", "17-3"]],
        [["10-1", "10-2","27-1", "27-2", "10103-1", "10103-2", "10013-1", "10013-2", "10014-1"]]
      ]
  ]
}

const convert = (jData) => {
    const utf8Str = unescape(encodeURIComponent
        (JSON.stringify(jData)))
    const res = btoa(utf8Str)
    return res
}

router.get('/', async (req, res) => {
    if (!req.user) return res.send([])
    const { target, access } = req.query
    const base64 = convert(defaultSetting)
    let data = ''
    console.log(`---downloading ${target}---`)
    console.log(`---code: ${access}---`)
    if (access !== 'vissim123') {
      return res.send({ error: 'token not valid' })
    }
    switch(target) {
      case 'setting.json':
        data = await apiService.send({
          url: 'http://140.238.40.158:8000/api/v1/download_setting',
          method: 'POST',
          token: 'vissim123',
        })
        return res.send(data)
      case 'setting_explain.txt':
        data = await apiService.send({
          url: 'http://140.238.40.158:8000/api/v1/download_setting_explain',
          method: 'POST',
          token: 'vissim123',
        })
        return res.send(data)
      case 'train.py':
        data = await apiService.send({
          url: 'http://140.238.40.158:8000/api/v1/download_train',
          method: 'POST',
          token: 'vissim123',
          data: `data:application/json;base64,${base64}`
        })
        return res.send(data)
      case 'test.py':
        data = await apiService.send({
          url: 'http://140.238.40.158:8000/api/v1/download_test',
          method: 'POST',
          token: 'vissim123',
          data: `data:application/json;base64,${base64}`
        })
        return res.send(data)
      default:
        return res.send('')
    }
})

module.exports = router
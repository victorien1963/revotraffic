import axios from 'axios'
import React, { StrictMode, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import PropTypes from 'prop-types'

// const BACKEND_DOMAIN = 'http://localhost:8000';
const BACKEND_DOMAIN = process.env.REACT_APP_VISSIM_BACKEND_DOMAIN || 'http://localhost:8000'

let root = null

const styles = {
  body: {
    textAlign: 'left',
  },
  container: {
    padding: '20px',
    width: '100%',
    maxWidth: '1200px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '26px',
    color: '#0e594f',
  },
  text_box: {
    width: '80px',
  },
  sub_title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#698b87',
  },
  section: {
    marginBottom: '20px',
  },
  text: {
    fontSize: '16px',
    padding: '20px',
    marginBottom: '10px',
  },
  input: {
    width: '80%',
    padding: '10px',
    borderRadius: '8px',
    background: 'transparent',
    outline: 'none',
    fontSize: '16px',
  },
  fileInput: {
    background: 'transparent',
    outline: 'none',
  },
  button: {
    border: 'none',
    color: '#536a28',
    background: '#bde570',
    padding: '0.75rem 0.375rem',
    margin: '5px',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease',
  },
  buttonHover: {
    transform: 'scale(1.1)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
  },
  containerBox: {
    marginTop: '20px',
  },
  addRemoveButton: {
    width: '30px',
    height: '30px',
    backgroundColor: 'transparent',
    color: '#000',
    border: '2px solid #000',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
}

// Reusable Add/Remove Button Component
function AddRemoveButton({ onClick, children, disabled = false }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={styles.addRemoveButton}>
      {children}
    </button>
  )
}

AddRemoveButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
}

AddRemoveButton.defaultProps = {
  disabled: false,
}

function DefaultSignal() {
  // const [textValue, setTextValue] = useState('');
  // const [nowSelect, setNowSelect] = useState('EN-US');
  const [accessValue] = useState('vissim123')
  const [fileSrc, setFileSrc] = useState({})
  // 全域設定參數
  const [inpxFilePath, setInpxFilePath] = useState('')
  const [layxFilePath, setLayxFilePath] = useState('')
  const [quickMode, setQuickMode] = useState(1)
  const [simulationTime, setSimulationTime] = useState(3900)
  const [yellowTime, setYellowTime] = useState(30)
  const [redTime, setRedTime] = useState(30)
  const [trainEpochs, setTrainEpochs] = useState(100)
  const [testEpochs, setTestEpochs] = useState(5)

  // 路口數量
  const [scNums, setScNums] = useState(1)
  const [scNames, setScNames] = useState([''])
  const [scIds, setScIds] = useState([''])
  const [sigActions, setSigActions] = useState([
    [
      [0, 0],
      [0, 0],
    ],
  ])
  const [sigActionsColdTimes, setSigActionsColdTimes] = useState([[100, 100]])

  // 20250327 燈號組額外處理
  const [sigD, setSigD] = useState([2]) // 時相，好像叫 signal direction，簡稱 sigD 好了
  const [sigG, setSigG] = useState([2]) // 燈號組， group 簡稱 sigG

  const handleSigValueChange = (scIndex, row, col, event) => {
    const newValue = Number(event.target.value) // 將輸入值強制轉為數字
    setSigActions((prev) => {
      const updated = [...prev]
      if (!updated[scIndex]) updated[scIndex] = []
      if (!updated[scIndex][row]) {
        updated[scIndex][row] = Array(sigG[scIndex]).fill(0) // 確保行長度符合燈號組數
      }

      updated[scIndex][row][col] = newValue // 更新為數字

      // 確保這一行有足夠的欄位數量（補充缺失的欄位）
      updated[scIndex][row] = Array.from({ length: sigG[scIndex] }).map((_, index) => {
        const value = updated[scIndex][row][index]

        return value === undefined ? 0 : value
      })
      return updated
    })
  }

  const handleSigColdTimeChange = (scIndex, row, event) => {
    const newValue = Number(event.target.value)
    setSigActionsColdTimes((prev) => {
      const updated = [...prev]
      if (!updated[scIndex]) updated[scIndex] = []
      if (!updated[scIndex][row]) updated[scIndex][row] = Array(sigG[scIndex]).fill(100)

      updated[scIndex][row] = newValue // 更新為數字

      return updated
    })
  }

  // 進入/離開路段，結構：每個路口包含 4 個方向，每個方向的路段 ID 是一個陣列
  const [vissimInLaneName, setVissimInLaneName] = useState(
    Array.from({ length: scNums }, () => [[], [], [], []])
  )

  const [vissimOutLaneName, setVissimOutLaneName] = useState(
    Array.from({ length: scNums }, () => [[], [], [], []])
  )

  // 20250423 忽略面積之路段
  const [ignoreAreaLaneList, setIgnoreAreaLaneList] = useState([])

  // 20250506 State變動時儲存到 cookies
  const isInitializedRef = useRef(false)
  useEffect(() => {
    console.log('讀取state...')
    const saved = localStorage.getItem('vissim_config')
    if (saved) {
      try {
        const config = JSON.parse(saved)
        console.log('載入設定檔...config.train_epochs=', config.train_epochs)

        setInpxFilePath(config.inpxFilePath || '')
        setLayxFilePath(config.layxFilePath || '')
        setQuickMode(config.quickMode || 1)
        setSimulationTime(config.vissim_one_round_simulationTime || 3900)
        setTrainEpochs(config.train_epochs || 100)
        setTestEpochs(config.test_epochs || 5)
        setYellowTime(config.YELLOW_TIME || 30)
        setRedTime(config.RED_TIME || 30)
        setScNames(config.sc_names || [''])
        setScIds(config.sc_ids || [''])
        setSigActions(
          config.sigActions || [
            [
              [0, 0],
              [0, 0],
            ],
          ]
        )
        setSigActionsColdTimes(config.sigActionsColdTimes || [[100, 100]])
        setVissimInLaneName(config.vissim_in_lane_name || [])
        setVissimOutLaneName(config.vissim_out_lane_name || [])
        setIgnoreAreaLaneList(config.ignore_area_lane_list || [])
        setSigD(config.sigD || [2])
        setSigG(config.sigG || [2])
        setScNums(config.scNums || config.sc_names?.length || 1)

        isInitializedRef.current = true
      } catch (err) {
        console.error('載入設定失敗：', err)
      }
    } else {
      isInitializedRef.current = true
    }
  }, [])

  useEffect(() => {
    if (!isInitializedRef.current) return

    console.log('State變動', trainEpochs)

    const config = {
      inpxFilePath,
      layxFilePath,
      quickMode,
      vissim_one_round_simulationTime: simulationTime,
      train_epochs: trainEpochs,
      test_epochs: testEpochs,
      YELLOW_TIME: yellowTime,
      RED_TIME: redTime,
      sc_names: scNames,
      sc_ids: scIds,
      sigActions,
      sigActionsColdTimes,
      vissim_in_lane_name: vissimInLaneName,
      vissim_out_lane_name: vissimOutLaneName,
      ignore_area_lane_list: ignoreAreaLaneList,
      scNums,
      sigD,
      sigG,
    }

    localStorage.setItem('vissim_config', JSON.stringify(config))
  }, [
    inpxFilePath,
    layxFilePath,
    quickMode,
    simulationTime,
    trainEpochs,
    testEpochs,
    yellowTime,
    redTime,
    scNames,
    scIds,
    sigActions,
    sigActionsColdTimes,
    vissimInLaneName,
    vissimOutLaneName,
    ignoreAreaLaneList,
    scNums,
    sigD,
    sigG,
  ])

  const handleSigDChange = (index, e) => {
    const newD = Number(e.target.value)
    setSigD((prev) => {
      const next = [...prev]
      next[index] = newD
      return next
    })

    setSigActionsColdTimes((prev) =>
      prev.map((times, i) => {
        if (i !== index) return times
        return Array.from({ length: newD }, (_unused, row) => times?.[row] ?? 100)
      })
    )

    setSigActions((prev) =>
      prev.map((actions, i) => {
        if (i !== index) return actions
        const g = sigG[index]
        return Array.from({ length: newD }, (_unusedRow, row) =>
          Array.from({ length: g }, (_unusedCol, col) => actions?.[row]?.[col] ?? 0)
        )
      })
    )
  }

  const handleSigGChange = (index, e) => {
    const newG = Number(e.target.value)
    setSigG((prev) => {
      const next = [...prev]
      next[index] = newG
      return next
    })
    setSigActions((prev) =>
      prev.map((actions, i) => {
        if (i !== index) return actions
        const d = sigD[index]
        return Array.from({ length: d }, (_unusedRow, row) =>
          Array.from({ length: newG }, (_unusedCol, col) => actions?.[row]?.[col] ?? 0)
        )
      })
    )
  }

  const handleScNumsChange = (e) => {
    const num = Math.max(1, Math.min(8, Number(e.target.value)))
    setScNums(num)

    setScNames((prev) => Array.from({ length: num }, (_, i) => prev[i] ?? ''))
    setScIds((prev) => Array.from({ length: num }, (_, i) => prev[i] ?? ''))
    setSigActions((prev) =>
      Array.from(
        { length: num },
        (_, i) =>
          prev[i] ?? [
            [0, 0],
            [0, 0],
          ]
      )
    )
    setSigActionsColdTimes((prev) => Array.from({ length: num }, (_, i) => prev[i] ?? [100, 100]))

    setVissimInLaneName((prev) =>
      Array.from({ length: num }, (_, i) => prev[i] ?? [[], [], [], []])
    )
    setVissimOutLaneName((prev) =>
      Array.from({ length: num }, (_, i) => prev[i] ?? [[], [], [], []])
    )

    setSigD((prev) => Array.from({ length: num }, (_, i) => prev[i] ?? 2))
    setSigG((prev) => Array.from({ length: num }, (_, i) => prev[i] ?? 2))
  }

  // 安全解析 JSON
  const handleTextareaChange = (setter, index, e) => {
    const inputValue = e.target.value
    try {
      const parsedValue = JSON.parse(inputValue)
      setter((prev) => {
        const updated = [...prev]
        updated[index] = parsedValue
        return updated
      })
    } catch (error) {
      console.error('JSON 格式錯誤:', error)
    }
  }

  // 下載 JSON 設定檔
  const handleDownload = () => {
    const config = {
      inpxFilePath,
      layxFilePath,
      quickMode: Number(quickMode),
      vissim_one_round_simulationTime: Number(simulationTime),
      train_epochs: Number(trainEpochs),
      test_epochs: Number(testEpochs),
      YELLOW_TIME: Number(yellowTime),
      RED_TIME: Number(redTime),
      sc_names: scNames,
      sc_ids: scIds.map(Number),
      sigActions,
      sigActionsColdTimes,
      vissim_in_lane_name: vissimInLaneName,
      vissim_out_lane_name: vissimOutLaneName,
      ignore_area_lane_list: ignoreAreaLaneList,
    }

    const jsonString = JSON.stringify(config, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'vissim_setting.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const downloadFilePost = async (api) => {
    try {
      if (!root) {
        const rootElement = document.getElementById('container')
        if (rootElement) root = createRoot(rootElement)
      }
      if (root) {
        root.render(
          <StrictMode>
            <div style={{ whiteSpace: 'pre-wrap' }} />
          </StrictMode>
        )
      }

      console.log(process.env)

      await axios({
        url: `${BACKEND_DOMAIN}/api/v1/${api}`,
        headers: {
          Authorization: `Bearer ${accessValue}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        data: fileSrc,
        responseType: 'blob',
      })
        .then((response) => {
          const disposition = response.headers['content-disposition'] || ''
          const fileName = decodeURIComponent(
            (disposition.split('filename=')[1] || 'download.dat').replaceAll('"', '')
          )
          const href = URL.createObjectURL(response.data)
          const link = document.createElement('a')
          link.href = href
          link.setAttribute('download', fileName)
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(href)
        })
        .catch((err) => {
          console.log(err)
          if (root) {
            root.render(
              <StrictMode>
                <div style={{ whiteSpace: 'pre-wrap' }}>錯誤:驗證碼不符合</div>
              </StrictMode>
            )
          }
        })
    } catch (err) {
      console.log('err1')
      console.log(err)
      if (root) {
        root.render(
          <StrictMode>
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {String(err?.response?.message || err.message)}
            </div>
          </StrictMode>
        )
      }
    }
  }

  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const config = JSON.parse(event.target.result)

        // 基礎設定
        setInpxFilePath(config.inpxFilePath || '')
        setLayxFilePath(config.layxFilePath || '')
        setQuickMode(config.quickMode ?? 1)
        setSimulationTime(config.vissim_one_round_simulationTime ?? 3900)
        setTrainEpochs(config.train_epochs ?? 100)
        setTestEpochs(config.test_epochs ?? 5)
        setYellowTime(config.YELLOW_TIME ?? 30)
        setRedTime(config.RED_TIME ?? 30)

        // 路口相關
        const num = config.sc_names?.length || 1
        setScNums(num)
        setScNames(config.sc_names || [''])
        setScIds(config.sc_ids?.map(String) || ['']) // ID 統一轉成字串，避免 input number 出 bug
        setSigActions(
          config.sigActions || [
            [
              [0, 0],
              [0, 0],
            ],
          ]
        )
        setSigActionsColdTimes(config.sigActionsColdTimes || [[100, 100]])
        setVissimInLaneName(
          config.vissim_in_lane_name || Array.from({ length: num }, () => [[], [], [], []])
        )
        setVissimOutLaneName(
          config.vissim_out_lane_name || Array.from({ length: num }, () => [[], [], [], []])
        )
        setIgnoreAreaLaneList(config.ignore_area_lane_list || [])

        // 額外參數（如果有）
        setSigD(config.sigD || Array.from({ length: num }, () => 2))
        setSigG(config.sigG || Array.from({ length: num }, () => 2))
      } catch (err) {
        console.error('JSON 解析失敗:', err)
        alert('上傳的檔案不是有效的設定檔！')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const setFileHandler = (event) => {
    const { files } = event.target
    if (files.length > 0) {
      const file = files[0]
      const reader = new FileReader()
      reader.addEventListener(
        'load',
        () => {
          setFileSrc(reader.result)
        },
        false
      )
      if (file) {
        reader.readAsDataURL(file)
      }
    }
  }

  const handleScNameChange = (index, e) => {
    const { value } = e.target
    setScNames((prev) => {
      const updated = [...prev]
      updated[index] = value // 允許直接輸入字串
      return updated
    })
  }

  const handleDownloadExamplePDF = () => {
    const fileUrl = '/VISSIM_RL_explain.pdf'
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = 'VISSIM_RL_explain.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFileChange = (setter) => (event) => {
    const file = event.target.files[0]
    if (file) {
      setter(file.name) // 只能取得檔案名稱，無法取得完整路徑
    }
  }

  return (
    <div style={styles.body}>
      <div style={{ ...styles.container, overflowY: 'auto' }}>
        <h1 style={styles.title}>VISSIM_RL 程式碼生成器</h1>
        <div style={styles.section}>
          <button
            type="button"
            style={styles.button}
            onClick={() => downloadFilePost('download_setting')}
          >
            下載設定檔範本
          </button>
          <button type="button" style={styles.button} onClick={() => handleDownloadExamplePDF()}>
            下載設定檔說明文件
          </button>
        </div>

        <div className="p-6 w-full bg-white shadow-md rounded-lg">
          <h2 style={styles.sub_title} className="text-xl font-bold mb-4">
            設定檔編輯器
          </h2>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            {/* 匯入設定檔 */}
            <label htmlFor="import-config-file" style={styles.button}>
              匯入設定檔
              <input
                id="import-config-file"
                type="file"
                accept="application/json"
                onChange={handleUpload}
                style={{ display: 'none' }} // 隱藏原生 input
              />
            </label>

            {/* 清除設定檔 */}
            <button
              type="button"
              style={styles.button}
              onClick={() => {
                localStorage.removeItem('vissim_config')
                window.location.reload()
              }}
            >
              將設定清除
            </button>
          </div>
          <br />
          <br />
          {/* 全域設定輸入 */}
          <span>
            由於瀏覽器的 File Selecter 只能抓檔名不能抓路徑，使用時，請把 train.py、test.py與 .inpx
            、 .layx 放在同一個資料夾
          </span>
          <br />
          <br />
          <span>INPX File Path:</span>
          <br />
          <br />
          <input type="file" accept=".inpx" onChange={handleFileChange(setInpxFilePath)} />
          {inpxFilePath && <p>上次選擇檔案：{inpxFilePath}</p>}
          <br />
          <br />

          <span>LAYX File Path:</span>
          <br />
          <br />
          <input type="file" accept=".layx" onChange={handleFileChange(setLayxFilePath)} />
          {layxFilePath && <p>上次選擇檔案：{layxFilePath}</p>}
          <br />
          <br />

          <span>Quick Mode (0 or 1):</span>
          <br />
          <select value={quickMode} onChange={(e) => setQuickMode(Number(e.target.value))}>
            <option value={1}>1 (啟用快速模式)</option>
            <option value={0}>0 (關閉快速模式)</option>
          </select>
          <br />
          <br />

          <span>訓練時跑幾輪:</span>
          <br />
          <input
            type="number"
            value={trainEpochs}
            onChange={(e) => setTrainEpochs(e.target.value)}
          />
          <br />
          <br />

          <span>測試時跑幾輪:</span>
          <br />
          <input type="number" value={testEpochs} onChange={(e) => setTestEpochs(e.target.value)} />
          <br />
          <br />
          <br />

          <span>Simulation Time 單位(1單位=0.1秒):</span>
          <br />
          <input
            type="number"
            value={simulationTime}
            onChange={(e) => setSimulationTime(e.target.value)}
          />
          <br />
          <br />

          <span>黃燈時間 單位(1單位=0.1秒):</span>
          <br />
          <input type="number" value={yellowTime} onChange={(e) => setYellowTime(e.target.value)} />
          <br />
          <br />

          <span>全紅時間 單位(1單位=0.1秒):</span>
          <br />
          <input type="number" value={redTime} onChange={(e) => setRedTime(e.target.value)} />
          <br />
          <br />
          <br />

          <span>忽略面積計算的路段ID列表</span>
          <br />
          <span>若路段A與路段B重疊，則把其中一個路段ID填到這個列表中</span>
          <br />
          <span>按 + 增加欄位，按 - 移除欄位，每個欄位填1個路段ID</span>
          <br />
          <span>路段ID從 VISSIM 找，格式例如 10068-1</span>
          <br />
          <div className="mb-2">
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
              {ignoreAreaLaneList.map((lane, laneIdx) => (
                <input
                  style={styles.text_box}
                  key={laneIdx}
                  type="text"
                  value={lane}
                  onChange={(e) => {
                    const newLaneNames = [...ignoreAreaLaneList]
                    newLaneNames[laneIdx] = e.target.value
                    setIgnoreAreaLaneList(newLaneNames)
                  }}
                  className="p-1 border rounded"
                />
              ))}
              <AddRemoveButton
                onClick={() => {
                  const newLaneNames = [...ignoreAreaLaneList]
                  newLaneNames.push('') // 加入一個空白欄位
                  setIgnoreAreaLaneList(newLaneNames)
                }}
              >
                +
              </AddRemoveButton>
              {ignoreAreaLaneList.length > 0 && (
                <AddRemoveButton
                  onClick={() => {
                    const newLaneNames = [...ignoreAreaLaneList]
                    newLaneNames.pop() // 刪除最後一個欄位
                    setIgnoreAreaLaneList(newLaneNames)
                  }}
                >
                  -
                </AddRemoveButton>
              )}
            </div>
            <br />
            <br />
          </div>

          <span>路口數量 (1-8):</span>
          <br />
          <input type="number" min="1" max="8" value={scNums} onChange={handleScNumsChange} />
          <br />
          <br />

          {/* 路口設定 */}
          {Array.from({ length: scNums }).map((_, i) => (
            <div key={i} className="mt-4 p-4 border rounded">
              <h3 style={styles.sub_title} className="text-lg font-semibold">
                路口 {i + 1}
              </h3>

              <span>名稱:</span>
              <br />
              <input value={scNames[i]} onChange={(e) => handleScNameChange(i, e)} />
              <br />

              <span>ID:</span>
              <br />
              <input
                type="number"
                value={scIds[i]}
                onChange={(e) => handleTextareaChange(setScIds, i, e)}
              />
              <br />

              <br />
              <span>燈號設定:</span>
              <br />
              <span>此路口有幾個時相:</span>
              <br />
              <input
                type="number"
                min="2"
                max="99"
                value={sigD[i]}
                onChange={(e) => handleSigDChange(i, e)}
              />
              <br />
              <span>此路口有幾個燈號組:</span>
              <br />
              <input
                type="number"
                min="2"
                max="99"
                value={sigG[i]}
                onChange={(e) => handleSigGChange(i, e)}
              />
              <br />
              <br />

              {Array.from({ length: sigD[i] || 0 }).map((_unusedRow, row) => (
                <React.Fragment key={row}>
                  <div className="font-semibold text-right pr-2">第 {row + 1} 時相</div>

                  {Array.from({ length: sigG[i] || 0 }).map((_unusedCol, col) => {
                    const inputIndex = row * sigG[i] + col // 計算燈號組的索引
                    return (
                      <input
                        key={inputIndex}
                        type="number"
                        min="0"
                        max="1"
                        value={sigActions[i]?.[row]?.[col] || 0} // 使用三層結構來存取值
                        onChange={(e) => handleSigValueChange(i, row, col, e)} // 更新三層結構
                        className="w-12 p-1 border rounded text-center"
                      />
                    )
                  })}
                </React.Fragment>
              ))}
              <br />
              <br />

              <span>最短綠燈時間:</span>
              <br />
              {Array.from({ length: sigD[i] || 0 }).map((_unusedRow, row) => (
                <React.Fragment key={row}>
                  <div className="font-semibold text-right pr-2">第 {row + 1} 時相</div>

                  <input
                    key={row}
                    type="number"
                    min="0"
                    max="86400"
                    value={sigActionsColdTimes[i]?.[row] || 100}
                    onChange={(e) => handleSigColdTimeChange(i, row, e)}
                    className="w-12 p-1 border rounded text-center"
                  />
                </React.Fragment>
              ))}
              <br />
              <br />

              {/* 進入路段設定 */}
              <span>路段ID設定</span>
              <br />
              <span>按 + 增加欄位，按 - 移除欄位，每個欄位填1個路段ID</span>
              <br />
              <span>路段ID從 VISSIM 找，格式例如 12255-1</span>
              <br />
              <span>進入路段 (右、下、左、上):</span>
              {['右', '下', '左', '上'].map((dir, dirIndex) => (
                <div key={dirIndex} className="mb-2">
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span className="font-semibold">{dir}:</span>
                    {vissimInLaneName[i][dirIndex].map((lane, laneIdx) => (
                      <input
                        style={styles.text_box}
                        key={laneIdx}
                        type="text"
                        value={lane}
                        onChange={(e) => {
                          const newLaneNames = [...vissimInLaneName]
                          newLaneNames[i][dirIndex][laneIdx] = e.target.value
                          setVissimInLaneName(newLaneNames)
                        }}
                        className="p-1 border rounded"
                      />
                    ))}
                    <AddRemoveButton
                      onClick={() => {
                        const newLaneNames = [...vissimInLaneName]
                        newLaneNames[i][dirIndex].push('') // 加入一個空白欄位
                        setVissimInLaneName(newLaneNames)
                      }}
                    >
                      +
                    </AddRemoveButton>
                    {vissimInLaneName[i][dirIndex].length > 0 && (
                      <AddRemoveButton
                        onClick={() => {
                          const newLaneNames = [...vissimInLaneName]
                          newLaneNames[i][dirIndex].pop() // 刪除最後一個欄位
                          setVissimInLaneName(newLaneNames)
                        }}
                      >
                        -
                      </AddRemoveButton>
                    )}
                  </div>
                </div>
              ))}

              <span>離開路段 (右、下、左、上):</span>
              {['右', '下', '左', '上'].map((dir, dirIndex) => (
                <div key={dirIndex} className="mb-2">
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span className="font-semibold">{dir}:</span>
                    {vissimOutLaneName[i][dirIndex].map((lane, laneIdx) => (
                      <input
                        style={styles.text_box}
                        key={laneIdx}
                        type="text"
                        value={lane}
                        onChange={(e) => {
                          const newLaneNames = [...vissimOutLaneName]
                          newLaneNames[i][dirIndex][laneIdx] = e.target.value
                          setVissimOutLaneName(newLaneNames)
                        }}
                        className="p-1 border rounded"
                      />
                    ))}
                    <AddRemoveButton
                      onClick={() => {
                        const newLaneNames = [...vissimOutLaneName]
                        newLaneNames[i][dirIndex].push('') // 加入一個空白欄位
                        setVissimOutLaneName(newLaneNames)
                      }}
                    >
                      +
                    </AddRemoveButton>
                    {vissimOutLaneName[i][dirIndex].length > 0 && (
                      <AddRemoveButton
                        onClick={() => {
                          const newLaneNames = [...vissimOutLaneName]
                          newLaneNames[i][dirIndex].pop() // 刪除最後一個欄位
                          setVissimOutLaneName(newLaneNames)
                        }}
                      >
                        -
                      </AddRemoveButton>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}

          <button type="button" style={styles.button} className="mt-6" onClick={handleDownload}>
            下載設定檔
          </button>
        </div>

        <div style={styles.section}>
          <p style={styles.sub_title}>上傳設定檔</p>
          <input type="file" onChange={setFileHandler} style={styles.fileInput} />
        </div>
        <div style={styles.section}>
          <p> 執行方法：先下載train.py執行之後再執行test.py。</p>
          <button
            type="button"
            style={styles.button}
            onClick={() => downloadFilePost('download_train')}
          >
            下載 train.py
          </button>
          <button
            type="button"
            style={styles.button}
            onClick={() => downloadFilePost('download_test')}
          >
            下載 test.py
          </button>
        </div>
        <div id="container" style={styles.containerBox} />
      </div>
    </div>
  )
}

export default DefaultSignal

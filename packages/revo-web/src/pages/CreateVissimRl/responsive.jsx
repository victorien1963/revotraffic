import React, { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import PropTypes from 'prop-types'
import axios from 'axios'

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

function ResponsiveSignal() {
  const [accessValue] = useState('vissim123')
  const [fileSrc, setFileSrc] = useState({})
  // 全域設定參數
  const [inpxFilePath, setInpxFilePath] = useState('')
  const [layxFilePath, setLayxFilePath] = useState('')
  const [quickMode, setQuickMode] = useState(1)
  const [simulationTime, setSimulationTime] = useState(3900)
  const [epochs, setEpochs] = useState(100)

  // 路口數量
  const [scNums, setScNums] = useState(1)
  const [scNames, setScNames] = useState([''])
  const [scIds, setScIds] = useState([])

  const [signalCycle, setSignalCycle] = useState(Array.from({ length: scNums }, () => 200))
  const [mainRoadNo, setMainRoadNo] = useState(Array.from({ length: scNums }, () => 1))
  const [branchRoadNo, setBranchRoadNo] = useState(Array.from({ length: scNums }, () => 2))
  const [todSec, setTodSec] = useState(Array.from({ length: scNums }, () => 1))
  const [linkRoadId, setLinkRoadId] = useState(Array.from({ length: scNums }, () => null))
  const [fixedSignals, setFixedSignals] = useState(Array.from({ length: scNums }, () => [[]]))

  const [vissimInLaneName, setVissimInLaneName] = useState(Array.from({ length: scNums }, () => []))

  const [profileInputValue, setProfileInputValue] = useState('')

  // 新增時相
  const handleAddPhase = (roadIndex) => {
    const newSignals = [...fixedSignals]
    newSignals[roadIndex].push([]) // 新增一個空時相
    setFixedSignals(newSignals)
  }

  // 新增時間點
  const handleAddSignalPoint = (roadIndex, phaseIndex) => {
    const newSignals = [...fixedSignals]
    newSignals[roadIndex][phaseIndex].push([0, 'GREEN']) // 預設 [0, GREEN]
    setFixedSignals(newSignals)
  }

  // 修改時間點
  const handleChangeSignalPoint = (roadIndex, phaseIndex, pointIndex, field, value) => {
    const newSignals = [...fixedSignals]
    if (field === 'time') {
      newSignals[roadIndex][phaseIndex][pointIndex][0] = Number(value)
    } else if (field === 'color') {
      newSignals[roadIndex][phaseIndex][pointIndex][1] = value
    }
    setFixedSignals(newSignals)
  }

  // 移除時間點
  const handleRemoveSignalPoint = (roadIndex, phaseIndex, pointIndex) => {
    const newSignals = [...fixedSignals]
    newSignals[roadIndex][phaseIndex].splice(pointIndex, 1)
    setFixedSignals(newSignals)
  }

  // 移除時相
  const handleRemovePhase = (roadIndex, phaseIndex) => {
    const newSignals = [...fixedSignals]
    newSignals[roadIndex].splice(phaseIndex, 1)
    setFixedSignals(newSignals)
  }

  const handleScNumsChange = (e) => {
    const num = Math.max(1, Math.min(8, Number(e.target.value)))
    setScNums(num)
    setScNames((prev) => Array.from({ length: num }, (_, i) => prev[i] ?? ''))
    setScIds((prev) => Array.from({ length: num }, (_, i) => prev[i] ?? 0))
    setVissimInLaneName((prev) => Array.from({ length: num }, (_, i) => prev[i] ?? []))
    setSignalCycle((prev) => Array.from({ length: num }, (_, i) => prev[i] ?? 200))
    setMainRoadNo((prev) => Array.from({ length: num }, (_, i) => prev[i] ?? 1))
    setBranchRoadNo((prev) => Array.from({ length: num }, (_, i) => prev[i] ?? 2))
    setTodSec((prev) => Array.from({ length: num }, (_, i) => prev[i] ?? 1))
    setLinkRoadId((prev) => Array.from({ length: num }, (_, i) => prev[i] ?? null))
    setFixedSignals((prev) => Array.from({ length: num }, (_, i) => prev[i] ?? [[]]))
  }

  // 下載 JSON 設定檔
  const handleDownload = () => {
    const roadSettings = Array.from({ length: scNums }).map((_, i) => ({
      road_name: scNames[i] || `路口${i + 1}`,
      road_id: Number(scIds[i]) || i + 1,
      singal_cycle_len_sec: Number(signalCycle[i]),
      main_road_no: Number(mainRoadNo[i]),
      branch_road_no: Number(branchRoadNo[i]),
      branch_input_road_id: vissimInLaneName[i] || [],
      fixed_signals: fixedSignals[i] || [],
      tod_sec: Number(todSec[i]),
      link_road_id: linkRoadId[i],
    }))

    const config = {
      inpxFilePath,
      layxFilePath,
      quickMode: Number(quickMode),
      vissim_one_round_simulationTime: Number(simulationTime),
      epochs: Number(epochs),
      road_settings: roadSettings,
    }

    const jsonString = JSON.stringify(config, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'vissim_responsive_signal_setting.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const downloadFilePost = async (api) => {
    try {
      const rootElement = document.getElementById('container')
      if (!rootElement) {
        console.error('Container element not found')
        return
      }

      if (!root) {
        root = createRoot(rootElement)
      }
      root.render(
        <StrictMode>
          <div style={{ whiteSpace: 'pre-wrap' }} />
        </StrictMode>
      )

      console.log(fileSrc)
      console.log(api)

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
          const fileName = decodeURIComponent(
            response.headers['content-disposition'].split('filename=')[1]
          ).replaceAll('"', '')
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
          root.render(
            <StrictMode>
              <div style={{ whiteSpace: 'pre-wrap' }}>錯誤:驗證碼不符合</div>
            </StrictMode>
          )
        })
    } catch (err) {
      console.log('err1')
      console.log(err)
      root.render(
        <StrictMode>
          <div style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(err.response.message, 1, 2)}</div>
        </StrictMode>
      )
    }
  }

  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const config = JSON.parse(event.target.result)

        // 更新基礎設定
        console.log('config=', config)
        setInpxFilePath(config.inpxFilePath || '')
        setLayxFilePath(config.layxFilePath || '')
        setQuickMode(config.quickMode || 0)
        setSimulationTime(config.vissim_one_round_simulationTime || 0)
        setEpochs(config.epochs || 0)

        // // 更新路口數量
        const roads = config.road_settings || []
        if (!roads.length) {
          console.log('roads is empty')
          return
        }
        console.log('roads=', roads)
        setScNums(roads.length)

        // // 更新各個路口的欄位
        setScNames(roads.map((r) => r.road_name || ''))
        setScIds(roads.map((r) => r.road_id || 0))
        setSignalCycle(roads.map((r) => r.singal_cycle_len_sec || 200))
        setMainRoadNo(roads.map((r) => r.main_road_no || 1))
        setBranchRoadNo(roads.map((r) => r.branch_road_no || 2))
        setVissimInLaneName(roads.map((r) => r.branch_input_road_id || []))
        setFixedSignals(roads.map((r) => r.fixed_signals || [[]]))
        setTodSec(roads.map((r) => r.tod_sec || 1))
        setLinkRoadId(roads.map((r) => r.link_road_id || null))

        // // 重置 file input
        setProfileInputValue('')
      } catch (err) {
        console.error('JSON 解析失敗:', err)
        alert('上傳的檔案不是有效的設定檔！')
        // 重置 file input on error
        setProfileInputValue('')
      }
    }
    reader.readAsText(file)
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
    const fileUrl = '/VISSIM_responsive_signal_explain.pdf'
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = 'VISSIM_responsive_signal_explain.pdf'
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
        <h1 style={styles.title}>感應號誌程式碼生成器</h1>
        <div style={styles.section}>
          <button
            type="button"
            style={styles.button}
            onClick={() => downloadFilePost('download_responsive_signal_setting', {})}
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
                value={profileInputValue}
              />
            </label>

            {/* 清除設定檔 */}
            <button
              type="button"
              style={styles.button}
              onClick={() => {
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
            由於瀏覽器的 File Selecter 只能抓檔名不能抓路徑，使用時，請把 responsive_signal.py 與
            .inpx 、 .layx 放在同一個資料夾
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

          <span>跑幾輪:</span>
          <br />
          <input type="number" value={epochs} onChange={(e) => setEpochs(e.target.value)} />
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

          <span>路口數量:</span>
          <br />
          <input type="number" min="1" max="99999" value={scNums} onChange={handleScNumsChange} />
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
                onChange={(e) => {
                  const newIds = [...scIds]
                  newIds[i] = Number(e.target.value)
                  setScIds(newIds)
                }}
              />
              <br />
              <br />

              <span>號誌週期 (秒):</span>
              <br />
              <input
                type="number"
                value={signalCycle[i]}
                onChange={(e) => {
                  const updated = [...signalCycle]
                  updated[i] = Number(e.target.value)
                  setSignalCycle(updated)
                }}
              />
              <br />
              <br />

              <span>幹道時相編號:</span>
              <br />
              <input
                type="number"
                value={mainRoadNo[i]}
                onChange={(e) => {
                  const updated = [...mainRoadNo]
                  updated[i] = Number(e.target.value)
                  setMainRoadNo(updated)
                }}
              />
              <br />
              <br />

              <span>支道時相編號:</span>
              <br />
              <input
                type="number"
                value={branchRoadNo[i]}
                onChange={(e) => {
                  const updated = [...branchRoadNo]
                  updated[i] = Number(e.target.value)
                  setBranchRoadNo(updated)
                }}
              />
              <br />
              <br />

              <span>TOD 秒數:</span>
              <br />
              <input
                type="number"
                value={todSec[i]}
                onChange={(e) => {
                  const updated = [...todSec]
                  updated[i] = Number(e.target.value)
                  setTodSec(updated)
                }}
              />
              <br />
              <br />

              <span>連動路口ID (留空為不連動):</span>
              <br />
              <input
                type="number"
                value={linkRoadId[i] ?? ''}
                onChange={(e) => {
                  const updated = [...linkRoadId]
                  updated[i] = e.target.value ? Number(e.target.value) : null
                  setLinkRoadId(updated)
                }}
              />
              <br />
              <br />

              <div>
                <span>路段ID設定 (請填支線進入路段的ID):</span>
                <br />
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '4px',
                  }}
                >
                  {vissimInLaneName[i].map((lane, laneIdx) => (
                    <input
                      key={laneIdx}
                      type="text"
                      value={lane}
                      onChange={(e) => {
                        const newLaneNames = [...vissimInLaneName]
                        newLaneNames[i][laneIdx] = e.target.value
                        setVissimInLaneName(newLaneNames)
                      }}
                      style={styles.text_box}
                      className="p-1 border rounded"
                    />
                  ))}
                  <AddRemoveButton
                    onClick={() => {
                      const newLaneNames = [...vissimInLaneName]
                      newLaneNames[i].push('')
                      setVissimInLaneName(newLaneNames)
                    }}
                  >
                    +
                  </AddRemoveButton>
                  {vissimInLaneName[i].length > 0 && (
                    <AddRemoveButton
                      onClick={() => {
                        const newLaneNames = [...vissimInLaneName]
                        newLaneNames[i].pop()
                        setVissimInLaneName(newLaneNames)
                      }}
                    >
                      -
                    </AddRemoveButton>
                  )}
                </div>
              </div>
              <div>
                <span>燈號時間軸設定:</span>
                <br />
                {fixedSignals[i].map((phase, phaseIndex) => (
                  <div key={phaseIndex} style={{ marginLeft: '20px', marginBottom: '10px' }}>
                    <div>
                      Phase {phaseIndex + 1}{' '}
                      <button
                        type="button"
                        style={{ marginLeft: '10px' }}
                        onClick={() => handleRemovePhase(i, phaseIndex)}
                      >
                        移除此時相
                      </button>
                    </div>
                    {phase.map((point, pointIndex) => (
                      <div
                        key={pointIndex}
                        style={{
                          display: 'flex',
                          gap: '10px',
                          marginLeft: '20px',
                          alignItems: 'center',
                        }}
                      >
                        <input
                          type="number"
                          value={point[0]}
                          onChange={(e) =>
                            handleChangeSignalPoint(
                              i,
                              phaseIndex,
                              pointIndex,
                              'time',
                              e.target.value
                            )
                          }
                          placeholder="時間點"
                        />
                        <select
                          value={point[1]}
                          onChange={(e) =>
                            handleChangeSignalPoint(
                              i,
                              phaseIndex,
                              pointIndex,
                              'color',
                              e.target.value
                            )
                          }
                        >
                          <option value="GREEN">GREEN</option>
                          <option value="AMBER">AMBER</option>
                          <option value="RED">RED</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveSignalPoint(i, phaseIndex, pointIndex)}
                        >
                          移除
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => handleAddSignalPoint(i, phaseIndex)}>
                      新增時間點
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => handleAddPhase(i)}>
                  新增時相
                </button>
              </div>
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
          <button
            type="button"
            style={styles.button}
            onClick={() => downloadFilePost('download_responsive_signal_code', {})}
          >
            下載 responsive_signal.py
          </button>
        </div>
        <div id="container" style={styles.containerBox} />
      </div>
    </div>
  )
}

export default ResponsiveSignal

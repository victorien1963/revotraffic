import React, { useState, useEffect, useMemo, createContext } from 'react'
import PropTypes from 'prop-types'
import { Manager } from 'socket.io-client'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'
import apiServices from '../services/apiServices'

function ContextProvider(props) {
  const { children } = props
  const [auth, setAuth] = useState({
    authed: false,
  })
  const authValue = useMemo(() => ({ auth, setAuth }), [auth])
  const { authed, user_id } = auth

  const checkToken = async () => {
    const { user } = await apiServices.me()
    if (user) {
      setAuth({
        authed: true,
        ...user,
      })
    }
  }
  useEffect(() => {
    checkToken()
  }, [])

  const [socket, setSocket] = useState(null)
  useEffect(() => {
    if (!authed) return () => {}
    const manager = new Manager(window.location.origin)
    const newSocket = manager.socket('/', {
      auth: {
        auth: user_id,
      },
    })
    setSocket(newSocket)
    return () => newSocket.close()
  }, [setSocket, authed, user_id])
  const sendMessage = (type, message) => socket.emit(type, message)
  const socketValue = useMemo(() => ({ socket, sendMessage }), [socket])

  const [drafts, setDrafts] = useState([])
  const [draftId, setDraftId] = useState('')
  const handleDraftAdd = async (data) => {
    const res = await apiServices.data({
      path: 'draft',
      method: 'post',
      data,
    })
    setDrafts((prevState) => [...prevState, res])
  }
  const handleDraftDelete = async (draft_id) => {
    const res = await apiServices.data({
      path: `draft/${draft_id}`,
      method: 'delete',
    })
    setDrafts((prevState) =>
      prevState.filter((p) => res.draft_id !== p.draft_id)
    )
  }
  const handleDraftEdit = async (draft_id, data) => {
    const res = await apiServices.data({
      path: `draft/${draft_id}`,
      method: 'put',
      data,
    })
    setDrafts((prevState) =>
      prevState.map((p) => (p.draft_id === draft_id ? res : p))
    )
  }
  const draft = useMemo(
    () =>
      drafts && draftId
        ? drafts.find(({ draft_id }) => draft_id === draftId)
        : false,
    [drafts, draftId]
  )
  const initDrafts = async () => {
    const res = await apiServices.data({
      path: `draft`,
      method: 'get',
    })
    setDrafts(res)
  }

  const [ranges, setRanges] = useState([])
  const [rangeId, setRangeId] = useState('')
  const handleRangeAdd = async (data) => {
    const res = await apiServices.data({
      path: `range/${draftId}`,
      method: 'post',
      data,
    })
    setRanges((prevState) => [...prevState, res])
  }
  const handleRangeDelete = async (range_id) => {
    const res = await apiServices.data({
      path: `range/${range_id}`,
      method: 'delete',
    })
    setRanges((prevState) =>
      prevState.filter((p) => res.range_id !== p.range_id)
    )
  }
  const range = useMemo(
    () =>
      ranges && rangeId
        ? ranges.find(({ range_id }) => range_id === rangeId)
        : false,
    [ranges, rangeId]
  )
  useEffect(() => {
    if (!draftId) {
      setRanges([])
      setRangeId('')
      return
    }
    const initRanges = async () => {
      const res = await apiServices.data({
        path: `range/${draftId}`,
        method: 'get',
      })
      setRanges(res)
    }
    initRanges()
  }, [draftId])

  const [times, setTimes] = useState([])
  const [timeId, setTimeId] = useState('')
  const handleTimeAdd = async (data) => {
    const res = await apiServices.data({
      path: `time/${rangeId}`,
      method: 'post',
      data,
    })
    setTimes((prevState) => [...prevState, res])
  }
  const handleTimeDelete = async (time_id) => {
    const res = await apiServices.data({
      path: `time/${time_id}`,
      method: 'delete',
    })
    setTimes((prevState) => prevState.filter((p) => res.time_id !== p.time_id))
  }
  const time = useMemo(
    () =>
      times && timeId ? times.find(({ time_id }) => time_id === timeId) : false,
    [times, timeId]
  )
  useEffect(() => {
    if (!rangeId) {
      setTimes([])
      setTimeId('')
      return
    }
    const initTimes = async () => {
      const res = await apiServices.data({
        path: `time/${rangeId}`,
        method: 'get',
      })
      setTimes(res)
    }
    initTimes()
  }, [rangeId])

  const draftValue = useMemo(
    () => ({
      // draft
      draft,
      drafts,
      draftId,
      setDraftId,
      // range
      range,
      ranges,
      rangeId,
      setRangeId,
      // time
      time,
      times,
      timeId,
      setTimeId,
      handleDraftAdd,
      handleRangeAdd,
      handleTimeAdd,
      handleDraftDelete,
      handleDraftEdit,
      setDrafts,
      setRanges,
      setTimes,
      handleRangeDelete,
      handleTimeDelete,
    }),
    [drafts, draftId, ranges, rangeId, times, timeId]
  )
  useEffect(() => {
    if (!socket) return
    socket.on('me', (message) => {
      setAuth({
        ...auth,
        setting: {
          ...(auth.setting || {}),
          ...message,
        },
      })
    })
  }, [socket])
  useEffect(() => {
    if (authed) initDrafts()
  }, [authed])

  const [toast, setToast] = useState({ show: false, text: '' })
  const toastValue = useMemo(() => ({ toast, setToast }), [toast])
  return (
    <>
      {/* <NotiContext.Provider value={notification}> */}
      <ToastContext.Provider value={toastValue}>
        <AuthContext.Provider value={authValue}>
          <DraftContext.Provider value={draftValue}>
            <SocketContext.Provider value={socketValue}>
              {children}
            </SocketContext.Provider>
          </DraftContext.Provider>
        </AuthContext.Provider>
      </ToastContext.Provider>
      {/* </NotiContext.Provider> */}
      <ToastContainer className="p-3" position="bottom-end">
        <Toast
          onClose={() => setToast({ ...toast, show: false })}
          show={toast.show}
          delay={3000}
          autohide
          style={{ width: '100%' }}
        >
          <Toast.Body>{toast.text}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  )
}

ContextProvider.propTypes = {
  children: PropTypes.shape().isRequired,
}

export default ContextProvider

export const DraftContext = createContext(null)
// export const NotiContext = createContext([])
export const SocketContext = createContext({
  socket: null,
  sendMessage: () => {},
})
export const AuthContext = createContext({
  auth: {
    authed: false,
  },
  setAuth: () => {},
})
export const ToastContext = createContext({
  toast: { show: false, text: '' },
  setToast: () => {},
})

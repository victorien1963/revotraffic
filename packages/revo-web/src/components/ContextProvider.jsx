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
  const draft = useMemo(
    () =>
      drafts && draftId
        ? drafts.find(({ draft_id }) => draft_id === draftId)
        : {},
    [drafts, draftId]
  )
  const initDrafts = async () => {
    const res = await apiServices.data({
      path: `draft`,
      method: 'get',
    })
    setDrafts(res)
  }

  const draftValue = useMemo(
    () => ({
      draft,
      drafts,
      draftId,
      setDraftId,
      handleDraftAdd,
      handleDraftDelete,
      setDrafts,
    }),
    [drafts, draftId]
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

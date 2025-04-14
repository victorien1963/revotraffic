import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Modal,
  Form,
  Badge,
} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEdit,
  faTrash,
  faPlus,
  faUserShield,
} from '@fortawesome/free-solid-svg-icons'
import moment from 'moment'
import { AuthContext, ToastContext } from '../components/ContextProvider'
import apiServices from '../services/apiServices'
import useRoleAndPermission, { Role } from '../hooks/useRoleAndPermission'

// User form component for create/edit operations
function UserForm({ show, user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: Role.VISITOR,
  })
  const [showPassword, setShowPassword] = useState(!user)

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user?.role || Role.VISITOR,
      })
      setShowPassword(false)
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: Role.VISITOR,
      })
      setShowPassword(true)
    }
  }, [user, show])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = () => {
    // Validate form
    if (
      !formData.name ||
      !formData.email ||
      (!user && !formData.password) ||
      !formData.role
    ) {
      return
    }

    // Create data object, omitting password if it's empty (for updates)
    const userData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
    }

    // Only include password if it's provided or if it's a new user
    if (formData.password) {
      userData.password = formData.password
    }

    onSave(userData)
  }

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{user ? '編輯使用者' : '新增使用者'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>姓名</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="輸入姓名"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>電子郵件</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="輸入電子郵件"
              required
            />
          </Form.Group>

          {(showPassword || !user) && (
            <Form.Group className="mb-3">
              <Form.Label>密碼</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={user ? '保留空白不變更密碼' : '輸入密碼'}
                required={!user}
              />
            </Form.Group>
          )}

          {user && !showPassword && (
            <Button
              variant="link"
              className="mb-3 p-0"
              onClick={() => setShowPassword(true)}
            >
              變更密碼
            </Button>
          )}

          <Form.Group className="mb-3">
            <Form.Label>角色</Form.Label>
            <Form.Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              disabled={user?.role === Role.SUPER_ADMIN}
            >
              <option value="PROJECT_ADMIN">系統管理員</option>
              <option value="PROJECT_DESIGNER">系統設計師</option>
              <option value="VISITOR">訪客</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          取消
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          儲存
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

// Delete confirmation modal
function DeleteConfirmModal({ show, user, onClose, onConfirm }) {
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>刪除使用者</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {user && (
          <p>
            確定要刪除使用者 <strong>{user.name}</strong> ({user.email})
            嗎？此操作無法復原。
          </p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          取消
        </Button>
        <Button variant="danger" onClick={() => onConfirm(user)}>
          確認刪除
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

// Role badge component to display user roles with colors
function RoleBadge({ role }) {
  let variant = 'secondary'
  let label = '未知'

  switch (role) {
    case 'PROJECT_ADMIN':
      variant = 'danger'
      label = '系統管理員'
      break
    case 'PROJECT_DESIGNER':
      variant = 'success'
      label = '系統設計師'
      break
    case 'VISITOR':
      variant = 'info'
      label = '訪客'
      break
    default:
      break
  }

  return <Badge bg={variant}>{label}</Badge>
}

// Main UserManagement component
function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const { auth } = useContext(AuthContext)
  const { setToast } = useContext(ToastContext)
  const { checkPermission } = useRoleAndPermission()

  // Function to fetch users from API
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await apiServices.data({
        path: 'users',
        method: 'get',
      })

      if (response.users) {
        setUsers(response.users)
      } else if (response.error) {
        setToast({
          show: true,
          text: `获取用户失败: ${response.error}`,
          type: 'danger',
        })
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setToast({
        show: true,
        text: '獲取用戶失敗',
        type: 'danger',
      })
    } finally {
      setLoading(false)
    }
  }

  // Load users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  // Handle create/update user
  const handleSaveUser = async (userData) => {
    try {
      if (selectedUser) {
        // Update existing user
        const response = await apiServices.data({
          path: `users/${selectedUser.user_id}`,
          method: 'put',
          data: userData,
        })

        if (response.user) {
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.user_id === response.user.user_id ? response.user : user
            )
          )
          setToast({
            show: true,
            text: '用戶更新成功',
            type: 'success',
          })
        } else if (response.error) {
          setToast({
            show: true,
            text: `用戶更新失敗: ${response.error}`,
            type: 'danger',
          })
        }
      } else {
        // Create new user
        const response = await apiServices.data({
          path: 'users',
          method: 'post',
          data: userData,
        })

        if (response.user) {
          setUsers((prevUsers) => [...prevUsers, response.user])
          setToast({
            show: true,
            text: '用戶創建成功',
            type: 'success',
          })
        } else if (response.error) {
          setToast({
            show: true,
            text: `用戶創建失敗: ${response.error}`,
            type: 'danger',
          })
        }
      }
      setShowForm(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error saving user:', error)
      setToast({
        show: true,
        text: '儲存用戶失敗',
        type: 'danger',
      })
    }
  }

  // Handle user deletion
  const handleDeleteUser = async (user) => {
    try {
      const response = await apiServices.data({
        path: `users/${user.user_id}`,
        method: 'delete',
      })

      if (response.success) {
        setUsers((prevUsers) =>
          prevUsers.filter((u) => u.user_id !== user.user_id)
        )
        setToast({
          show: true,
          text: '用戶刪除成功',
          type: 'success',
        })
      } else if (response.error) {
        setToast({
          show: true,
          text: `用戶刪除失敗: ${response.error}`,
          type: 'danger',
        })
      }
      setShowDeleteModal(false)
    } catch (error) {
      console.error('Error deleting user:', error)
      setToast({
        show: true,
        text: '刪除用戶失敗',
        type: 'danger',
      })
    }
  }

  // Check if current user is an admin
  const isUserAdmin = checkPermission([Role.PROJECT_ADMIN])

  if (!isUserAdmin) {
    return (
      <Container fluid className="py-4">
        <Row>
          <Col>
            <div className="text-center p-5">
              <FontAwesomeIcon
                icon={faUserShield}
                size="3x"
                className="mb-3 text-warning"
              />
              <h3>無訪問權限</h3>
              <p>您需要管理員權限才能訪問此頁面。</p>
            </div>
          </Col>
        </Row>
      </Container>
    )
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="text-revo">用戶管理</h2>
        </Col>
        <Col xs="auto">
          <Button
            variant="revo"
            onClick={() => {
              setSelectedUser(null)
              setShowForm(true)
            }}
          >
            <FontAwesomeIcon icon={faPlus} className="me-2" />
            新增使用者
          </Button>
        </Col>
      </Row>

      <Row>
        <Col>
          {loading ? (
            <div className="text-center p-5">
              <p>載入中...</p>
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>姓名</th>
                  <th>電子郵件</th>
                  <th>角色</th>
                  <th>建立日期</th>
                  <th>最後登入時間</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      沒有用戶記錄
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.user_id}>
                      <td>{user.user_id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <RoleBadge role={user.role || 'VISITOR'} />
                      </td>
                      <td>
                        {moment(user.created_on).format('YYYY-MM-DD HH:mm')}
                      </td>
                      <td>
                        {user.last_login
                          ? moment(user.last_login).format('YYYY-MM-DD HH:mm')
                          : '-'}
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => {
                            setSelectedUser(user)
                            setShowForm(true)
                          }}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </Button>

                        {/* Don't allow deleting your own account or the main admin */}
                        {user.user_id !== auth.user_id &&
                          user.role !== Role.SUPER_ADMIN && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setShowDeleteModal(true)
                              }}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </Button>
                          )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>

      {/* User Form Modal */}
      <UserForm
        show={showForm}
        user={selectedUser}
        onClose={() => {
          setShowForm(false)
          setSelectedUser(null)
        }}
        onSave={handleSaveUser}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        show={showDeleteModal}
        user={selectedUser}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedUser(null)
        }}
        onConfirm={handleDeleteUser}
      />
    </Container>
  )
}

export default UserManagement

// PropTypes validation
UserForm.propTypes = {
  show: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    user_id: PropTypes.number,
    name: PropTypes.string,
    email: PropTypes.string,
    setting: PropTypes.shape({
      role: PropTypes.string,
    }),
    role: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
}

DeleteConfirmModal.propTypes = {
  show: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    user_id: PropTypes.number,
    name: PropTypes.string,
    email: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
}

RoleBadge.propTypes = {
  role: PropTypes.string,
}

RoleBadge.defaultProps = {
  role: 'VISITOR',
}

UserForm.defaultProps = {
  user: null,
}

DeleteConfirmModal.defaultProps = {
  user: null,
}

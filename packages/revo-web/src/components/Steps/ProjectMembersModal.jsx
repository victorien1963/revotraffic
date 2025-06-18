import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import {
  Modal,
  Button,
  Form,
  ListGroup,
  Badge,
  Row,
  Col,
  Spinner,
  Alert,
} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTrash,
  faUserPlus,
  faEnvelope,
  faUserTag,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import { DraftUserRole, usePermissions } from '../../hooks/useRoleAndPermission'
import apiServices from '../../services/apiServices'
import { ToastContext } from '../ContextProvider'
import CustomComboBox from '../CustomComboBox'

// Component to display role badge with appropriate color
function RoleBadge({ role }) {
  let variant = 'secondary'
  let label = 'Unknown'

  switch (role) {
    case DraftUserRole.PROJECT_ADMIN:
      variant = 'danger'
      label = '計畫管理員'
      break
    case DraftUserRole.PROJECT_DESIGNER:
      variant = 'success'
      label = '工程師'
      break
    case DraftUserRole.VISITOR:
      variant = 'info'
      label = '訪客'
      break
    default:
      break
  }

  return (
    <Badge bg={variant} className="py-1 px-2">
      {label}
    </Badge>
  )
}

// Confirmation modal for removing a user
function RemoveConfirmModal({ show, user, onClose, onConfirm, loading }) {
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>移除使用者</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {user && (
          <div>
            <div className="d-flex mb-3">
              <FontAwesomeIcon
                className="text-warning mx-auto"
                style={{ height: '50px' }}
                icon={faCircleExclamation}
              />
            </div>
            <p className="text-center">
              確定要移除使用者 <strong>{user.name}</strong> ({user.email}) 嗎？
            </p>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          取消
        </Button>
        <Button
          variant="danger"
          onClick={() => onConfirm(user.user_id || user.id)}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-1" />
              處理中...
            </>
          ) : (
            '確認移除'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

function ProjectMembersModal({ show, onClose, project }) {
  const { hasPermission } = usePermissions()

  // State for the list of users with access
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { setToast } = useContext(ToastContext)

  // State for the confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [userToRemove, setUserToRemove] = useState(null)

  // State for available users to select from
  const [allUsers, setAllUsers] = useState([]) // Store all fetched users
  const [availableUsers, setAvailableUsers] = useState([]) // Store filtered users
  const [loadingUsers, setLoadingUsers] = useState(false)

  // State for the new user form
  const [newUser, setNewUser] = useState({
    email: '',
    role: hasPermission('assignProjectAdmin')
      ? DraftUserRole.PROJECT_ADMIN
      : DraftUserRole.VISITOR,
  })

  // Fetch members when component mounts or project changes
  useEffect(() => {
    const fetchMembers = async () => {
      if (!project || !project.draft_id) return

      setLoading(true)
      setError(null)

      try {
        const response = await apiServices.data({
          path: `draft/${project.draft_id}/members`,
          method: 'get',
        })

        if (response.error) {
          setError(response.error)
          setToast({
            show: true,
            text: `獲取專案成員失敗: ${response.error}`,
            type: 'danger',
          })
        } else {
          setUsers(response)
        }
      } catch (err) {
        setError(err.message || 'An error occurred')
        setToast({
          show: true,
          text: '獲取專案成員失敗',
          type: 'danger',
        })
      } finally {
        setLoading(false)
      }
    }

    if (show) {
      fetchMembers()
    }
  }, [project, show, setError, setLoading, setToast, setUsers])

  // Fetch available users when component mounts
  useEffect(() => {
    const fetchAvailableUsers = async () => {
      if (!show) return

      setLoadingUsers(true)

      try {
        const response = await apiServices.data({
          path: 'users/non-super-admin-users',
          method: 'get',
        })

        if (response.error) {
          console.error('Error fetching users:', response.error)
        } else if (response.users) {
          // Format users for the ComboBox
          const formattedUsers = response.users.map((user) => ({
            value: user.email,
            label: `${user.name} (${user.email})`,
          }))
          setAllUsers(formattedUsers)
        }
      } catch (err) {
        console.error('Error fetching users:', err)
      } finally {
        setLoadingUsers(false)
      }
    }

    fetchAvailableUsers()
  }, [show, setAllUsers, setLoadingUsers])

  // Filter out users who have already been added to the project
  useEffect(() => {
    if (allUsers.length > 0) {
      // Get emails of users who are already project members
      const existingEmails = users.map((user) => user.email)

      // Filter out users who are already in the project
      const filteredUsers = allUsers.filter(
        (user) => !existingEmails.includes(user.value)
      )

      setAvailableUsers(filteredUsers)
    }
  }, [allUsers, users])

  // Handle adding a new user
  const handleAddUser = async (e) => {
    e.preventDefault()

    if (!newUser.email) return

    setLoading(true)

    try {
      const response = await apiServices.data({
        path: `draft/${project.draft_id}/members`,
        method: 'post',
        data: { email: newUser.email, role: newUser.role },
      })

      if (response.error) {
        setError(response.error)
        setToast({
          show: true,
          text: `新增使用者失敗: ${response.error}`,
          type: 'danger',
        })
      } else {
        // Refresh the member list
        const membersResponse = await apiServices.data({
          path: `draft/${project.draft_id}/members`,
          method: 'get',
        })

        if (!membersResponse.error) {
          setUsers(membersResponse)
          setToast({
            show: true,
            text: '使用者已成功新增',
            type: 'success',
          })

          // The users list has been updated, the useEffect will automatically filter availableUsers
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
      setToast({
        show: true,
        text: '新增使用者失敗',
        type: 'danger',
      })
    } finally {
      setLoading(false)
      setNewUser({
        email: '',
        role: hasPermission('assignProjectAdmin')
          ? DraftUserRole.PROJECT_ADMIN
          : DraftUserRole.VISITOR,
      })
    }
  }

  // Show confirmation modal before removing a user
  const showRemoveConfirmation = (user) => {
    setUserToRemove(user)
    setShowConfirmModal(true)
  }

  // Handle removing a user after confirmation
  const handleRemoveUser = async (userId) => {
    setLoading(true)

    try {
      const response = await apiServices.data({
        path: `draft/${project.draft_id}/members/${userId}`,
        method: 'delete',
      })

      if (response.error) {
        setError(response.error)
        setToast({
          show: true,
          text: `移除使用者失敗: ${response.error}`,
          type: 'danger',
        })
      } else {
        // Update the local state
        setUsers(users.filter((user) => (user.user_id || user.id) !== userId))
        setToast({
          show: true,
          text: '使用者已成功移除',
          type: 'success',
        })

        // The users list has been updated, the useEffect will automatically update availableUsers
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
      setToast({
        show: true,
        text: '移除使用者失敗',
        type: 'danger',
      })
    } finally {
      setLoading(false)
      setShowConfirmModal(false)
    }
  }

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {project ? `${project.setting.name} - ` : ''}專案存取權限管理
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Current Users Section */}
        <h5 className="mb-3 text-revo">
          <FontAwesomeIcon icon={faUserTag} className="me-2" />
          目前使用者
        </h5>

        {error && (
          <Alert variant="danger" className="mb-3">
            {typeof error === 'string' ? error : '獲取專案成員失敗，請稍後再試'}
          </Alert>
        )}

        <ListGroup className="mb-4">
          {loading && (
            <ListGroup.Item className="text-center py-3">
              <Spinner animation="border" size="sm" className="me-2" />
              載入中...
            </ListGroup.Item>
          )}

          {!loading && users.length === 0 && (
            <ListGroup.Item className="text-center text-muted">
              目前沒有使用者可以存取此專案
            </ListGroup.Item>
          )}

          {!loading &&
            users.length > 0 &&
            users.map((user) => (
              <ListGroup.Item
                key={user.user_id || user.id}
                className="d-flex align-items-center"
              >
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <strong>{user.name}</strong>
                    </div>
                    <RoleBadge role={user.draft_user_role} />
                  </div>
                  <div className="text-muted small">
                    <FontAwesomeIcon icon={faEnvelope} className="me-1" />
                    {user.email}
                  </div>
                </div>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => showRemoveConfirmation(user)}
                  title="移除使用者"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </ListGroup.Item>
            ))}
        </ListGroup>

        {/* Add New User Section */}
        <h5 className="mb-3 text-revo">
          <FontAwesomeIcon icon={faUserPlus} className="me-2" />
          新增使用者
        </h5>
        <Form onSubmit={handleAddUser}>
          <Row className="align-items-end">
            <Col md={5}>
              <Form.Group className="mb-3">
                <Form.Label>電子郵件</Form.Label>
                <CustomComboBox
                  options={availableUsers}
                  value={newUser.email}
                  onChange={(value) => {
                    setNewUser({ ...newUser, email: value })
                  }}
                  placeholder="請選擇或輸入電子郵件"
                  disabled={loading || loadingUsers}
                  required
                  noResultsText={
                    loadingUsers ? '載入中...' : '沒有符合的使用者'
                  }
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>角色</Form.Label>
                <Form.Select
                  name="role"
                  value={newUser.role}
                  onChange={(e) => {
                    setNewUser({ ...newUser, role: e.target.value })
                  }}
                  required
                  disabled={loading}
                >
                  {hasPermission('assignProjectAdmin') && (
                    <option value={DraftUserRole.PROJECT_ADMIN}>
                      計畫管理員
                    </option>
                  )}
                  {hasPermission('editMembers', project?.draft_user_role) && (
                    <>
                      <option value={DraftUserRole.PROJECT_DESIGNER}>
                        工程師
                      </option>
                      <option value={DraftUserRole.VISITOR}>訪客</option>
                    </>
                  )}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={2}>
              <Button
                variant="revo"
                type="submit"
                className="mb-3 w-100"
                disabled={!newUser.email || loading}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-1" />
                    處理中...
                  </>
                ) : (
                  '新增'
                )}
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          關閉
        </Button>
      </Modal.Footer>

      {/* Remove User Confirmation Modal */}
      <RemoveConfirmModal
        show={showConfirmModal}
        user={userToRemove}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleRemoveUser}
        loading={loading}
      />
    </Modal>
  )
}

ProjectMembersModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  project: PropTypes.shape({
    setting: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }).isRequired,
    draft_id: PropTypes.number.isRequired,
    draft_user_role: PropTypes.string.isRequired,
  }),
}

ProjectMembersModal.defaultProps = {
  project: null,
}

RoleBadge.propTypes = {
  role: PropTypes.string.isRequired,
}

RemoveConfirmModal.propTypes = {
  show: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    user_id: PropTypes.number,
    id: PropTypes.number,
    name: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  loading: PropTypes.bool,
}

RemoveConfirmModal.defaultProps = {
  user: null,
  loading: false,
}

export default ProjectMembersModal

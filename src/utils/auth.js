const TokenKey = 'Authorization'
const UserIdKey = 'class_activity_system_user_id'
const roleKey = 'roles'
const discussionKey = 'class_activity_system_discussion_id'
const gradeKey = 'class_activity_system_grade_id'

export function getToken() {
  return sessionStorage.getItem(TokenKey)
}

export function setToken(token) {
  const normalizedToken = token && token.startsWith('Bearer ')
    ? token.substring(7)
    : token
  return sessionStorage.setItem(TokenKey, normalizedToken)
}

export function removeToken() {
  return sessionStorage.removeItem(TokenKey)
}


export function getUserId() {
  return sessionStorage.getItem(UserIdKey)
}
export function setUserId(userId) {
  return sessionStorage.setItem(UserIdKey, userId)
}

export function removeUserId() {
  return sessionStorage.removeItem(UserIdKey)
}

export function getRole() {
  return sessionStorage.getItem(roleKey)
}

export function setRole(role) {
  return sessionStorage.setItem(roleKey, role)
}

export function removeRole() {
  return sessionStorage.removeItem(roleKey)
}

export function getDiscussionId() {
  return sessionStorage.getItem(discussionKey)
}

export function setDiscussionId(id) {
  return sessionStorage.setItem(discussionKey, id)
}

export function removeDiscussionId() {
  return sessionStorage.removeItem(discussionKey)
}

export function getGradeId() {
  return sessionStorage.getItem(gradeKey)
}

export function setGradeId(id) {
  return sessionStorage.setItem(gradeKey, id)
}

export function removeGradeId() {
  return sessionStorage.removeItem(gradeKey)
}

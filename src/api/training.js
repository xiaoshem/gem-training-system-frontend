import request from '@/utils/request'

export function getCoursePage(params) {
  return request({ url: 'courses/paging', method: 'get', params })
}

export function getCourseDetail(id) {
  return request({ url: `courses/${id}`, method: 'get' })
}

export function getCourseOptions() {
  return request({ url: 'courses/options', method: 'get' })
}

export function addCourse(data) {
  return request({ url: 'courses', method: 'post', data })
}

export function updateCourse(id, data) {
  return request({ url: `courses/${id}`, method: 'put', data })
}

export function deleteCourse(id) {
  return request({ url: `courses/${id}`, method: 'delete' })
}

export function getInstructorPage(params) {
  return request({ url: 'instructors/paging', method: 'get', params })
}

export function getInstructorOptions() {
  return request({ url: 'instructors/options', method: 'get' })
}

export function getInstructorCandidates() {
  return request({ url: 'instructors/candidates', method: 'get' })
}

export function addInstructor(data) {
  return request({ url: 'instructors', method: 'post', data })
}

export function updateInstructor(id, data) {
  return request({ url: `instructors/${id}`, method: 'put', data })
}

export function deleteInstructor(id) {
  return request({ url: `instructors/${id}`, method: 'delete' })
}

export function getTrainingClassPage(params) {
  return request({ url: 'training-classes/paging', method: 'get', params })
}

export function getAvailableTrainingClasses(params) {
  return request({ url: 'training-classes/available', method: 'get', params })
}

export function getPublicTrainingClasses(params) {
  return request({ url: 'public/training-classes', method: 'get', params })
}

export function getPublicTrainingClassDetail(id) {
  return request({ url: `public/training-classes/${id}`, method: 'get' })
}

export function getPublicTrainingSessions(id) {
  return request({ url: `public/training-classes/${id}/sessions`, method: 'get' })
}

export function getTrainingClassDetail(id) {
  return request({ url: `training-classes/${id}`, method: 'get' })
}

export function addTrainingClass(data) {
  return request({ url: 'training-classes', method: 'post', data })
}

export function updateTrainingClass(id, data) {
  return request({ url: `training-classes/${id}`, method: 'put', data })
}

export function deleteTrainingClass(id) {
  return request({ url: `training-classes/${id}`, method: 'delete' })
}

export function publishTrainingClass(id) {
  return request({ url: `training-classes/${id}/publish`, method: 'put' })
}

export function unpublishTrainingClass(id) {
  return request({ url: `training-classes/${id}/unpublish`, method: 'put' })
}

export function cancelTrainingClass(id) {
  return request({ url: `training-classes/${id}/cancel`, method: 'put' })
}

export function getTrainingSessions(trainingClassId) {
  return request({ url: `training-sessions/class/${trainingClassId}`, method: 'get' })
}

export function addTrainingSession(data) {
  return request({ url: 'training-sessions', method: 'post', data })
}

export function updateTrainingSession(id, data) {
  return request({ url: `training-sessions/${id}`, method: 'put', data })
}

export function deleteTrainingSession(id) {
  return request({ url: `training-sessions/${id}`, method: 'delete' })
}

export function submitEnrollment(data) {
  return request({ url: 'enrollments', method: 'post', data })
}

export function getMyEnrollmentByClass(trainingClassId) {
  return request({ url: `enrollments/mine/class/${trainingClassId}`, method: 'get' })
}

export function getMyEnrollments(params) {
  return request({ url: 'enrollments/mine/paging', method: 'get', params })
}

export function getEnrollmentManagementPage(params) {
  return request({ url: 'enrollments/manage/paging', method: 'get', params })
}

export function admitEnrollment(id, data = {}) {
  return request({ url: `enrollments/${id}/admit`, method: 'put', data })
}

export function rejectEnrollment(id, data) {
  return request({ url: `enrollments/${id}/reject`, method: 'put', data })
}

export function cancelEnrollment(id) {
  return request({ url: `enrollments/${id}/cancel`, method: 'put' })
}

export function getMyPaymentOrders(params) {
  return request({ url: 'payment-orders/mine/paging', method: 'get', params })
}

export function getPaymentManagementPage(params) {
  return request({ url: 'payment-orders/manage/paging', method: 'get', params })
}

export function payPaymentOrder(id) {
  return request({ url: `payment-orders/${id}/pay`, method: 'put' })
}

export function getPaymentCapabilities() {
  return request({ url: 'payment-orders/capabilities', method: 'get' })
}

export function createAlipayPagePay(id) {
  return request({ url: `payment-orders/${id}/alipay/page-pay`, method: 'post' })
}

export function queryAlipayPayment(orderNo) {
  return request({ url: `payment-orders/alipay/query/${encodeURIComponent(orderNo)}`, method: 'post' })
}

export function getMyMessages(params) {
  return request({ url: 'user-messages/paging', method: 'get', params })
}

export function getUnreadMessageCount() {
  return request({ url: 'user-messages/unread-count', method: 'get' })
}

export function readMessage(id) {
  return request({ url: `user-messages/${id}/read`, method: 'put' })
}

export function readAllMessages() {
  return request({ url: 'user-messages/read-all', method: 'put' })
}

<template>
  <div class="app-container page-shell">
    <div class="page-heading"><h2>报名审核</h2><p>审核学员报名资料，录取时系统会校验剩余名额并生成缴费订单。</p></div>
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true">
        <el-form-item label="关键词"><el-input v-model="query.keyword" clearable placeholder="学员、报名编号或班次" @keyup.enter.native="search" /></el-form-item>
        <el-form-item label="状态"><el-select v-model="query.status" clearable placeholder="全部"><el-option v-for="item in statuses" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="search">查询</el-button><el-button @click="reset">重置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-table v-loading="loading" :data="page.records || []" border>
      <el-table-column prop="enrollmentNo" label="报名编号" min-width="190" />
      <el-table-column prop="realName" label="学员姓名" width="100" />
      <el-table-column prop="studentUserName" label="用户名" width="120" />
      <el-table-column prop="idCard" label="身份证号" width="190" />
      <el-table-column prop="phone" label="联系电话" width="130" />
      <el-table-column prop="organization" label="所在单位" min-width="140" show-overflow-tooltip />
      <el-table-column prop="position" label="岗位" min-width="110" show-overflow-tooltip />
      <el-table-column prop="className" label="培训班次" min-width="170" show-overflow-tooltip />
      <el-table-column label="状态" width="90" align="center"><template slot-scope="scope"><el-tag :type="statusType(scope.row.status)">{{ statusLabel(scope.row.status) }}</el-tag></template></el-table-column>
      <el-table-column prop="reviewReason" label="审核说明" min-width="140" show-overflow-tooltip />
      <el-table-column prop="createTime" label="报名时间" width="165" />
      <el-table-column label="操作" width="130" fixed="right" align="center">
        <template slot-scope="scope">
          <template v-if="scope.row.status === 'PENDING'">
            <el-button type="text" class="success-text" @click="admit(scope.row)">录取</el-button>
            <el-button type="text" class="danger-text" @click="reject(scope.row)">拒绝</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container"><el-pagination :current-page="page.current || 1" :page-size="query.pageSize" :total="page.total || 0" layout="total, prev, pager, next" @current-change="changePage" /></div>
  </div>
</template>

<script>
import { admitEnrollment, getEnrollmentManagementPage, rejectEnrollment } from '@/api/training'

export default {
  name: 'EnrollmentManagement',
  data() { return { loading: false, page: { records: [], total: 0 }, query: { pageNum: 1, pageSize: 10, keyword: '', status: '' }, statuses: [{ value: 'PENDING', label: '待审核' }, { value: 'ADMITTED', label: '已录取' }, { value: 'REJECTED', label: '未通过' }, { value: 'CANCELLED', label: '已取消' }] } },
  created() { this.loadData() },
  methods: {
    async loadData() { this.loading = true; try { const res = await getEnrollmentManagementPage(this.query); this.page = res.data || { records: [], total: 0 } } finally { this.loading = false } },
    search() { this.query.pageNum = 1; this.loadData() }, reset() { this.query = { pageNum: 1, pageSize: 10, keyword: '', status: '' }; this.loadData() }, changePage(value) { this.query.pageNum = value; this.loadData() },
    statusLabel(value) { return { PENDING: '待审核', ADMITTED: '已录取', REJECTED: '未通过', CANCELLED: '已取消' }[value] || value },
    statusType(value) { return { PENDING: 'warning', ADMITTED: 'success', REJECTED: 'danger', CANCELLED: 'info' }[value] || 'info' },
    admit(row) { this.$prompt('可填写录取说明（选填）', `录取“${row.realName}”`, { inputType: 'textarea', inputPlaceholder: '选填，最多500字', inputValidator: value => !value || value.length <= 500 || '不能超过500字' }).then(({ value }) => admitEnrollment(row.id, { reason: value || '' })).then(() => { this.$message.success('录取成功，已生成缴费订单'); this.loadData() }).catch(() => undefined) },
    reject(row) { this.$prompt('请填写拒绝原因，系统会通知学员', `拒绝“${row.realName}”的报名`, { inputType: 'textarea', inputPlaceholder: '必填，最多500字', inputValidator: value => { if (!value || !value.trim()) return '请填写拒绝原因'; return value.length <= 500 || '不能超过500字' } }).then(({ value }) => rejectEnrollment(row.id, { reason: value.trim() })).then(() => { this.$message.success('已拒绝报名并通知学员'); this.loadData() }).catch(() => undefined) }
  }
}
</script>

<style lang="scss" scoped>
.page-shell { min-height: calc(100vh - 84px); background: #f6f8fb; }.page-heading { margin-bottom: 18px; }.page-heading h2 { margin: 0 0 8px; }.page-heading p { margin: 0; color: #6b7280; }.filter-card { margin-bottom: 16px; }.filter-card ::v-deep .el-card__body { padding-bottom: 2px; }.pagination-container { padding-top: 20px; text-align: right; }.success-text { color: #67c23a; }.danger-text { color: #f56c6c; }
</style>

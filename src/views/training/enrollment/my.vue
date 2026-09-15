<template>
  <div class="app-container page-shell">
    <div class="page-heading">
      <div><h2>我的报名</h2><p>查看报名审核进度，并处理取消报名或录取后的缴费。</p></div>
      <el-button type="primary" plain @click="$router.push('/training-catalog')">继续浏览培训</el-button>
    </div>
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true">
        <el-form-item label="关键词"><el-input v-model="query.keyword" clearable placeholder="报名编号、课程或班次" @keyup.enter.native="search" /></el-form-item>
        <el-form-item label="报名状态">
          <el-select v-model="query.status" clearable placeholder="全部">
            <el-option v-for="item in statuses" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item><el-button type="primary" @click="search">查询</el-button><el-button @click="reset">重置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-table v-loading="loading" :data="page.records || []" border>
      <el-table-column prop="enrollmentNo" label="报名编号" min-width="190" />
      <el-table-column prop="className" label="培训班次" min-width="180" show-overflow-tooltip />
      <el-table-column prop="courseName" label="课程" min-width="150" show-overflow-tooltip />
      <el-table-column label="培训日期" width="190" align="center"><template slot-scope="scope">{{ scope.row.startDate }} 至 {{ scope.row.endDate }}</template></el-table-column>
      <el-table-column label="报名状态" width="100" align="center"><template slot-scope="scope"><el-tag :type="statusType(scope.row.status)">{{ statusLabel(scope.row.status) }}</el-tag></template></el-table-column>
      <el-table-column prop="reviewReason" label="审核说明" min-width="150" show-overflow-tooltip />
      <el-table-column label="缴费" width="110" align="center"><template slot-scope="scope">{{ paymentLabel(scope.row.paymentStatus) }}</template></el-table-column>
      <el-table-column prop="createTime" label="报名时间" width="165" />
      <el-table-column label="操作" width="150" fixed="right" align="center">
        <template slot-scope="scope">
          <el-button v-if="scope.row.status === 'ADMITTED' && scope.row.paymentStatus === 'UNPAID'" type="text" class="success-text" @click="goToPayment">去缴费</el-button>
          <el-button v-if="canCancel(scope.row)" type="text" class="danger-text" @click="cancel(scope.row)">取消报名</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-container"><el-pagination :current-page="page.current || 1" :page-size="query.pageSize" :total="page.total || 0" layout="total, prev, pager, next" @current-change="changePage" /></div>
  </div>
</template>

<script>
import { cancelEnrollment, getMyEnrollments } from '@/api/training'

export default {
  name: 'MyEnrollments',
  data() {
    return {
      loading: false,
      page: { records: [], total: 0 },
      query: { pageNum: 1, pageSize: 10, keyword: '', status: '' },
      statuses: [
        { value: 'PENDING', label: '待审核' }, { value: 'ADMITTED', label: '已录取' },
        { value: 'REJECTED', label: '未通过' }, { value: 'CANCELLED', label: '已取消' }
      ]
    }
  },
  created() { this.loadData() },
  methods: {
    async loadData() { this.loading = true; try { const res = await getMyEnrollments(this.query); this.page = res.data || { records: [], total: 0 } } finally { this.loading = false } },
    search() { this.query.pageNum = 1; this.loadData() },
    reset() { this.query = { pageNum: 1, pageSize: 10, keyword: '', status: '' }; this.loadData() },
    changePage(value) { this.query.pageNum = value; this.loadData() },
    statusLabel(value) { return { PENDING: '待审核', ADMITTED: '已录取', REJECTED: '未通过', CANCELLED: '已取消' }[value] || value },
    statusType(value) { return { PENDING: 'warning', ADMITTED: 'success', REJECTED: 'danger', CANCELLED: 'info' }[value] || 'info' },
    paymentLabel(value) { return { UNPAID: '待缴费', PAID: '已缴费', CANCELLED: '已关闭', REFUNDED: '已退款' }[value] || '—' },
    canCancel(row) { return ['PENDING', 'ADMITTED'].includes(row.status) && row.paymentStatus !== 'PAID' && new Date(`${row.startDate}T00:00:00`).getTime() > Date.now() },
    cancel(row) { this.$confirm(`确定取消“${row.className}”的报名吗？`, '提示', { type: 'warning' }).then(() => cancelEnrollment(row.id)).then(() => { this.$message.success('报名已取消'); this.loadData() }).catch(() => undefined) },
    goToPayment() { this.$router.push('/my-payments') }
  }
}
</script>

<style lang="scss" scoped>
.page-shell { min-height: calc(100vh - 84px); background: #f6f8fb; }
.page-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.page-heading h2 { margin: 0 0 8px; }.page-heading p { margin: 0; color: #6b7280; }
.filter-card { margin-bottom: 16px; }.filter-card ::v-deep .el-card__body { padding-bottom: 2px; }
.pagination-container { padding-top: 20px; text-align: right; }.success-text { color: #67c23a; }.danger-text { color: #f56c6c; }
</style>

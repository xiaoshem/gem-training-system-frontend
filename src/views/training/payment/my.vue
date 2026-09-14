<template>
  <div class="app-container page-shell">
    <div class="page-heading"><h2>我的缴费</h2><p>已录取的报名会自动生成模拟缴费订单。</p></div>
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true">
        <el-form-item label="关键词"><el-input v-model="query.keyword" clearable placeholder="订单号、报名编号或班次" @keyup.enter.native="search" /></el-form-item>
        <el-form-item label="订单状态"><el-select v-model="query.status" clearable placeholder="全部"><el-option label="待缴费" value="UNPAID" /><el-option label="已缴费" value="PAID" /><el-option label="已关闭" value="CANCELLED" /><el-option label="已退款" value="REFUNDED" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="search">查询</el-button><el-button @click="reset">重置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-table v-loading="loading" :data="page.records || []" border>
      <el-table-column prop="orderNo" label="订单号" min-width="190" />
      <el-table-column prop="enrollmentNo" label="报名编号" min-width="190" />
      <el-table-column prop="className" label="培训班次" min-width="180" show-overflow-tooltip />
      <el-table-column prop="courseName" label="课程" min-width="150" show-overflow-tooltip />
      <el-table-column label="金额" width="100" align="right"><template slot-scope="scope">¥{{ scope.row.amount }}</template></el-table-column>
      <el-table-column label="状态" width="100" align="center"><template slot-scope="scope"><el-tag :type="statusType(scope.row.status)">{{ statusLabel(scope.row.status) }}</el-tag></template></el-table-column>
      <el-table-column prop="transactionNo" label="交易流水号" min-width="160" />
      <el-table-column prop="paidAt" label="支付时间" width="165" />
      <el-table-column label="操作" width="100" fixed="right" align="center"><template slot-scope="scope"><el-button v-if="scope.row.status === 'UNPAID'" type="text" class="success-text" @click="pay(scope.row)">模拟缴费</el-button></template></el-table-column>
    </el-table>
    <div class="pagination-container"><el-pagination :current-page="page.current || 1" :page-size="query.pageSize" :total="page.total || 0" layout="total, prev, pager, next" @current-change="changePage" /></div>
  </div>
</template>

<script>
import { getMyPaymentOrders, payPaymentOrder } from '@/api/training'

export default {
  name: 'MyPayments',
  data() { return { loading: false, page: { records: [], total: 0 }, query: { pageNum: 1, pageSize: 10, keyword: '', status: '' } } },
  created() { this.loadData() },
  methods: {
    async loadData() { this.loading = true; try { const res = await getMyPaymentOrders(this.query); this.page = res.data || { records: [], total: 0 } } finally { this.loading = false } },
    search() { this.query.pageNum = 1; this.loadData() }, reset() { this.query = { pageNum: 1, pageSize: 10, keyword: '', status: '' }; this.loadData() }, changePage(value) { this.query.pageNum = value; this.loadData() },
    statusLabel(value) { return { UNPAID: '待缴费', PAID: '已缴费', CANCELLED: '已关闭', REFUNDED: '已退款' }[value] || value }, statusType(value) { return { UNPAID: 'warning', PAID: 'success', CANCELLED: 'info', REFUNDED: '' }[value] || 'info' },
    pay(row) { this.$confirm(`确认模拟支付 ¥${row.amount} 吗？支付后不能重复操作。`, '模拟缴费', { type: 'warning' }).then(() => payPaymentOrder(row.id)).then(() => { this.$message.success('模拟缴费成功'); this.loadData() }).catch(() => undefined) }
  }
}
</script>

<style lang="scss" scoped>
.page-shell { min-height: calc(100vh - 84px); background: #f6f8fb; }.page-heading { margin-bottom: 18px; }.page-heading h2 { margin: 0 0 8px; }.page-heading p { margin: 0; color: #6b7280; }.filter-card { margin-bottom: 16px; }.filter-card ::v-deep .el-card__body { padding-bottom: 2px; }.pagination-container { padding-top: 20px; text-align: right; }.success-text { color: #67c23a; }
</style>

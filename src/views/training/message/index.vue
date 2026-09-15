<template>
  <div class="app-container page-shell">
    <div class="page-heading">
      <div><h2>站内消息</h2><p>接收报名审核和缴费结果通知。</p></div>
      <el-button :disabled="!unreadCount" @click="readAll">全部标为已读</el-button>
    </div>
    <el-card shadow="never" class="filter-card">
      <el-checkbox v-model="query.unreadOnly" @change="search">只看未读</el-checkbox>
      <span class="unread-tip">未读 {{ unreadCount }} 条</span>
    </el-card>
    <el-table v-loading="loading" :data="page.records || []" border :row-class-name="rowClassName" @row-click="openMessage">
      <el-table-column label="状态" width="80" align="center"><template slot-scope="scope"><el-tag v-if="scope.row.isRead === 0" type="danger" size="mini">未读</el-tag><span v-else>已读</span></template></el-table-column>
      <el-table-column prop="title" label="标题" min-width="180" />
      <el-table-column prop="content" label="内容" min-width="420" show-overflow-tooltip />
      <el-table-column prop="createTime" label="时间" width="165" />
    </el-table>
    <div class="pagination-container"><el-pagination :current-page="page.current || 1" :page-size="query.pageSize" :total="page.total || 0" layout="total, prev, pager, next" @current-change="changePage" /></div>
  </div>
</template>

<script>
import { getMyMessages, getUnreadMessageCount, readAllMessages, readMessage } from '@/api/training'

export default {
  name: 'MyMessages',
  data() { return { loading: false, unreadCount: 0, page: { records: [], total: 0 }, query: { pageNum: 1, pageSize: 10, unreadOnly: false } } },
  created() { this.loadData(); this.loadUnreadCount() },
  methods: {
    async loadData() { this.loading = true; try { const res = await getMyMessages(this.query); this.page = res.data || { records: [], total: 0 } } finally { this.loading = false } },
    async loadUnreadCount() { const res = await getUnreadMessageCount(); this.unreadCount = Number(res.data || 0) },
    search() { this.query.pageNum = 1; this.loadData() }, changePage(value) { this.query.pageNum = value; this.loadData() },
    rowClassName({ row }) { return row.isRead === 0 ? 'unread-row' : '' },
    openMessage(row) { this.$alert(row.content, row.title, { confirmButtonText: '知道了' }); if (row.isRead === 0) readMessage(row.id).then(() => { row.isRead = 1; this.loadUnreadCount() }) },
    readAll() { readAllMessages().then(() => { this.$message.success('全部消息已标为已读'); this.loadData(); this.loadUnreadCount() }) }
  }
}
</script>

<style lang="scss" scoped>
.page-shell { min-height: calc(100vh - 84px); background: #f6f8fb; }.page-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }.page-heading h2 { margin: 0 0 8px; }.page-heading p { margin: 0; color: #6b7280; }.filter-card { margin-bottom: 16px; }.unread-tip { margin-left: 18px; color: #f56c6c; }.pagination-container { padding-top: 20px; text-align: right; }::v-deep .unread-row { font-weight: 600; cursor: pointer; }
</style>

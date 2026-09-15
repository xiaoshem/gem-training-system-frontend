<template>
  <div class="app-container page-shell">
    <div class="page-heading">
      <h2>我的缴费</h2>
      <p>已录取的报名会自动生成缴费订单，可使用支付宝沙箱或本地模拟完成缴费演示。</p>
    </div>

    <el-alert
      v-if="capabilities.alipaySandboxEnabled && !capabilities.alipaySandboxConfigured"
      class="config-alert"
      title="支付宝沙箱已启用但配置不完整，当前不能发起沙箱支付。"
      type="warning"
      :closable="false"
      show-icon
    />

    <el-card shadow="never" class="filter-card">
      <el-form :inline="true">
        <el-form-item label="关键词">
          <el-input v-model="query.keyword" clearable placeholder="订单号、报名编号或班次" @keyup.enter.native="search" />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="query.status" clearable placeholder="全部">
            <el-option label="待缴费" value="UNPAID" />
            <el-option label="已缴费" value="PAID" />
            <el-option label="已关闭" value="CANCELLED" />
            <el-option label="已退款" value="REFUNDED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-table v-loading="loading" :data="page.records || []" border>
      <el-table-column prop="orderNo" label="订单号" min-width="190" />
      <el-table-column prop="enrollmentNo" label="报名编号" min-width="190" />
      <el-table-column prop="className" label="培训班次" min-width="180" show-overflow-tooltip />
      <el-table-column prop="courseName" label="课程" min-width="150" show-overflow-tooltip />
      <el-table-column label="金额" width="100" align="right">
        <template slot-scope="scope">¥{{ scope.row.amount }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="statusType(scope.row.status)">{{ statusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="支付方式" width="130" align="center">
        <template slot-scope="scope">{{ channelLabel(scope.row.paymentChannel) }}</template>
      </el-table-column>
      <el-table-column prop="transactionNo" label="交易流水号" min-width="160" />
      <el-table-column prop="paidAt" label="支付时间" width="165" />
      <el-table-column label="操作" width="240" fixed="right" align="center">
        <template slot-scope="scope">
          <template v-if="scope.row.status === 'UNPAID'">
            <el-button
              v-if="capabilities.alipaySandboxAvailable"
              type="text"
              class="alipay-text"
              @click="startAlipay(scope.row)"
            >支付宝沙箱支付</el-button>
            <el-button
              v-if="capabilities.localSimulationEnabled"
              type="text"
              class="local-text"
              @click="localPay(scope.row)"
            >本地模拟</el-button>
            <span v-if="!hasPaymentMethod" class="muted">支付渠道未配置</span>
          </template>
          <el-button v-else type="text" @click="showPaymentDetail(scope.row)">查看支付详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        :current-page="page.current || 1"
        :page-size="query.pageSize"
        :total="page.total || 0"
        layout="total, prev, pager, next"
        @current-change="changePage"
      />
    </div>

    <el-dialog title="支付详情" :visible.sync="detailVisible" width="560px">
      <div v-if="detailOrder" class="payment-detail">
        <div class="detail-item detail-item-full">
          <span class="detail-label">订单号</span>
          <span class="detail-value">{{ displayText(detailOrder.orderNo) }}</span>
        </div>
        <div class="detail-item detail-item-full">
          <span class="detail-label">报名编号</span>
          <span class="detail-value">{{ displayText(detailOrder.enrollmentNo) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">培训班次</span>
          <span class="detail-value">{{ displayText(detailOrder.className) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">课程</span>
          <span class="detail-value">{{ displayText(detailOrder.courseName) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">金额</span>
          <span class="detail-value">¥{{ displayText(detailOrder.amount) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">订单状态</span>
          <span class="detail-value">{{ statusLabel(detailOrder.status) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">支付方式</span>
          <span class="detail-value">{{ channelLabel(detailOrder.paymentChannel) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">支付时间</span>
          <span class="detail-value">{{ displayText(detailOrder.paidAt) }}</span>
        </div>
        <div class="detail-item detail-item-full">
          <span class="detail-label">交易流水号</span>
          <span class="detail-value">{{ displayText(detailOrder.transactionNo) }}</span>
        </div>
      </div>
      <span slot="footer">
        <el-button type="primary" @click="detailVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  createAlipayPagePay,
  getMyPaymentOrders,
  getPaymentCapabilities,
  payPaymentOrder,
  queryAlipayPayment
} from '@/api/training'

export default {
  name: 'MyPayments',
  data() {
    return {
      loading: false,
      page: { records: [], total: 0 },
      query: { pageNum: 1, pageSize: 10, keyword: '', status: '' },
      capabilities: {
        localSimulationEnabled: false,
        alipaySandboxEnabled: false,
        alipaySandboxConfigured: false,
        alipaySandboxAvailable: false
      },
      detailVisible: false,
      detailOrder: null
    }
  },
  computed: {
    hasPaymentMethod() {
      return this.capabilities.localSimulationEnabled || this.capabilities.alipaySandboxAvailable
    }
  },
  created() {
    this.initialize()
  },
  methods: {
    async initialize() {
      await Promise.all([this.loadCapabilities(), this.loadData()])
      await this.handleAlipayReturn()
    },
    async loadCapabilities() {
      const res = await getPaymentCapabilities()
      this.capabilities = Object.assign({}, this.capabilities, res.data || {})
    },
    async loadData() {
      this.loading = true
      try {
        const res = await getMyPaymentOrders(this.query)
        this.page = res.data || { records: [], total: 0 }
      } finally {
        this.loading = false
      }
    },
    search() {
      this.query.pageNum = 1
      this.loadData()
    },
    reset() {
      this.query = { pageNum: 1, pageSize: 10, keyword: '', status: '' }
      this.loadData()
    },
    changePage(value) {
      this.query.pageNum = value
      this.loadData()
    },
    statusLabel(value) {
      return { UNPAID: '待缴费', PAID: '已缴费', CANCELLED: '已关闭', REFUNDED: '已退款' }[value] || value
    },
    statusType(value) {
      return { UNPAID: 'warning', PAID: 'success', CANCELLED: 'info', REFUNDED: '' }[value] || 'info'
    },
    channelLabel(value) {
      return { SIMULATED: '本地模拟', ALIPAY_SANDBOX: '支付宝沙箱' }[value] || '-'
    },
    displayText(value) {
      return value === null || value === undefined || value === '' ? '-' : value
    },
    showPaymentDetail(row) {
      this.detailOrder = Object.assign({}, row)
      this.detailVisible = true
    },
    async startAlipay(row) {
      const payWindow = window.open('', 'alipaySandboxCashier')
      if (!payWindow) {
        this.$message.error('浏览器阻止了支付窗口，请允许本站弹出窗口后重试')
        return
      }
      payWindow.document.write('<!doctype html><html><head><meta charset="UTF-8"><title>正在打开支付宝沙箱</title></head><body style="font-family:sans-serif;padding:32px">正在打开支付宝沙箱收银台，请稍候……</body></html>')
      try {
        const res = await createAlipayPagePay(row.id)
        const formHtml = res.data && res.data.formHtml
        if (!formHtml) {
          throw new Error('支付宝沙箱收银台内容为空')
        }
        payWindow.document.open()
        payWindow.document.write(formHtml)
        payWindow.document.close()
      } catch (error) {
        payWindow.close()
      }
    },
    async queryAlipay(orderNo) {
      this.loading = true
      try {
        const res = await queryAlipayPayment(orderNo)
        const data = res.data || {}
        if (data.orderStatus === 'PAID') {
          this.$message.success(data.message || '支付宝沙箱缴费成功')
        } else {
          this.$message.info(data.message || '支付宝订单尚未支付')
        }
        await this.loadData()
      } finally {
        this.loading = false
      }
    },
    localPay(row) {
      this.$confirm(`确认使用本地模拟方式支付 ¥${row.amount} 吗？该操作不会进入支付宝。`, '本地模拟缴费', {
        type: 'warning'
      }).then(() => payPaymentOrder(row.id)).then(() => {
        this.$message.success('本地模拟缴费成功')
        this.loadData()
      }).catch(() => undefined)
    },
    async handleAlipayReturn() {
      const returnState = this.$route.query.alipayReturn
      const orderNo = this.$route.query.outTradeNo
      if (!returnState) {
        return
      }
      if (returnState === 'invalid') {
        this.$message.error('支付宝同步返回验签失败，请刷新页面；若状态仍未更新，可重新进入支付宝沙箱支付')
      } else if (returnState === 'paid') {
        this.$message.success('支付宝沙箱缴费成功')
        await this.loadData()
      } else if (orderNo && this.capabilities.alipaySandboxAvailable) {
        await this.queryAlipay(orderNo)
      }
      this.$router.replace({ path: '/my-payments' }).catch(() => undefined)
    }
  }
}
</script>

<style lang="scss" scoped>
.page-shell { min-height: calc(100vh - 84px); background: #f6f8fb; }
.page-heading { margin-bottom: 18px; }
.page-heading h2 { margin: 0 0 8px; }
.page-heading p { margin: 0; color: #6b7280; }
.config-alert { margin-bottom: 16px; }
.filter-card { margin-bottom: 16px; }
.filter-card ::v-deep .el-card__body { padding-bottom: 2px; }
.pagination-container { padding-top: 20px; text-align: right; }
.alipay-text { color: #1677ff; }
.local-text { color: #67c23a; }
.muted { color: #909399; }
.payment-detail {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border-top: 1px solid #ebeef5;
  border-left: 1px solid #ebeef5;
}
.detail-item {
  display: flex;
  min-width: 0;
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
}
.detail-item-full { grid-column: 1 / -1; }
.detail-label {
  flex: 0 0 88px;
  padding: 12px;
  color: #606266;
  background: #f5f7fa;
}
.detail-value {
  min-width: 0;
  padding: 12px;
  color: #303133;
  word-break: break-all;
}
</style>

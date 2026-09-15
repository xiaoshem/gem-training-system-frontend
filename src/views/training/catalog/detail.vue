<template>
  <div class="detail-page">
    <el-button type="text" icon="el-icon-back" @click="$router.back()">返回培训列表</el-button>
    <div v-loading="loading">
      <section v-if="detail.id" class="detail-hero">
        <div class="hero-main">
          <span class="category">{{ detail.courseCategory }}</span>
          <h1>{{ detail.className }}</h1>
          <p>{{ detail.courseDescription || detail.courseName }}</p>
          <div class="hero-meta">
            <span><i class="el-icon-user" /> {{ detail.instructorName }}</span>
            <span><i class="el-icon-date" /> {{ detail.startDate }} 至 {{ detail.endDate }}</span>
            <span><i class="el-icon-location-outline" /> {{ detail.location }}</span>
          </div>
        </div>
        <aside class="summary-card">
          <div class="price">¥{{ detail.fee }}</div>
          <div>招生名额：{{ detail.capacity }} 人</div>
          <div>剩余名额：{{ detail.remainingCapacity == null ? detail.capacity : detail.remainingCapacity }} 人</div>
          <div>总课时：{{ detail.totalHours }} 课时</div>
          <div>报名时间：</div>
          <small>{{ detail.enrollmentStart }} 至<br>{{ detail.enrollmentEnd }}</small>
          <el-button type="primary" :disabled="enrollmentButtonDisabled" @click="handleEnrollmentButton">{{ enrollmentButtonText }}</el-button>
        </aside>
      </section>

      <div v-if="detail.id" class="content-grid">
        <main>
          <el-card shadow="never">
            <h2>课程大纲</h2>
            <div class="pre-line">{{ detail.syllabus }}</div>
          </el-card>
          <el-card shadow="never">
            <h2>课次安排</h2>
            <el-timeline v-if="sessions.length">
              <el-timeline-item v-for="item in sessions" :key="item.id" :timestamp="`${item.startTime} 至 ${item.endTime}`" placement="top">
                <div class="session-title">第 {{ item.sessionNo }} 课次 · {{ item.topic }}</div>
                <p>{{ item.content || '暂无内容说明' }}</p>
                <small>{{ item.instructorName }} · {{ item.location }}</small>
              </el-timeline-item>
            </el-timeline>
            <div v-else class="empty-state">暂无课次安排</div>
          </el-card>
        </main>
        <aside>
          <el-card shadow="never">
            <h3>适用对象</h3><p>{{ detail.targetAudience }}</p>
            <h3>前置要求</h3><p>{{ detail.prerequisites || '无特殊要求' }}</p>
            <h3>技能指标</h3><div class="pre-line">{{ detail.skillIndicators || '暂未填写' }}</div>
            <h3>评分细则</h3><div class="pre-line">{{ detail.scoringRules || '暂未填写' }}</div>
          </el-card>
        </aside>
      </div>
    </div>

    <el-dialog title="提交培训报名" :visible.sync="enrollmentDialogVisible" width="620px" :close-on-click-modal="false">
      <el-alert title="报名资料将作为审核快照保存，请确认信息真实准确。" type="info" :closable="false" />
      <el-form ref="enrollmentForm" :model="enrollmentForm" :rules="enrollmentRules" label-width="100px" class="enrollment-form">
        <el-row :gutter="18">
          <el-col :span="12"><el-form-item label="真实姓名" prop="realName"><el-input v-model.trim="enrollmentForm.realName" maxlength="50" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="联系电话" prop="phone"><el-input v-model.trim="enrollmentForm.phone" maxlength="11" placeholder="11位手机号码" /></el-form-item></el-col>
          <el-col :span="24"><el-form-item label="身份证号" prop="idCard"><el-input v-model.trim="enrollmentForm.idCard" maxlength="18" placeholder="18位身份证号" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="所在单位" prop="organization"><el-input v-model.trim="enrollmentForm.organization" maxlength="100" placeholder="选填" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="岗位" prop="position"><el-input v-model.trim="enrollmentForm.position" maxlength="100" placeholder="选填" /></el-form-item></el-col>
        </el-row>
      </el-form>
      <div slot="footer"><el-button @click="enrollmentDialogVisible = false">取消</el-button><el-button type="primary" :loading="submitting" @click="submitEnrollmentForm">提交报名</el-button></div>
    </el-dialog>
  </div>
</template>

<script>
import { getMyEnrollmentByClass, getPublicTrainingClassDetail, getPublicTrainingSessions, submitEnrollment } from '@/api/training'
import { getInfo } from '@/api/user'
import { getToken } from '@/utils/auth'

const emptyEnrollmentForm = () => ({ realName: '', idCard: '', organization: '', position: '', phone: '' })

export default {
  name: 'TrainingDetail',
  data() {
    return {
      loading: false, submitting: false, detail: {}, sessions: [], currentEnrollment: null,
      enrollmentDialogVisible: false, enrollmentForm: emptyEnrollmentForm(),
      enrollmentRules: {
        realName: [{ required: true, message: '请填写真实姓名', trigger: 'blur' }],
        phone: [{ required: true, message: '请填写联系电话', trigger: 'blur' }, { pattern: /^1\d{10}$/, message: '联系电话格式不正确', trigger: 'blur' }],
        idCard: [{ required: true, message: '请填写身份证号', trigger: 'blur' }, { pattern: /^\d{17}[0-9Xx]$/, message: '身份证号格式不正确', trigger: 'blur' }]
      }
    }
  },
  computed: {
    isLoggedIn() { return Boolean(getToken()) },
    isStudent() { return sessionStorage.getItem('roles') === 'student' },
    enrollmentButtonText() {
      if (!this.isLoggedIn) return '登录后报名'
      if (!this.isStudent) return '仅学员账号可报名'
      if (this.currentEnrollment) return `报名状态：${this.enrollmentStatusLabel(this.currentEnrollment.status)}`
      if (this.detail.classStatus === 'ENROLLING' && this.remainingCapacity > 0) return '立即报名'
      if (this.detail.classStatus === 'ENROLLING') return '名额已满'
      return { PLANNED: '报名尚未开始', UPCOMING: '报名已结束', IN_PROGRESS: '培训进行中', COMPLETED: '培训已结束' }[this.detail.classStatus] || '暂不可报名'
    },
    enrollmentButtonDisabled() {
      if (!this.isLoggedIn) return false
      if (this.currentEnrollment) return false
      return !this.isStudent || this.detail.classStatus !== 'ENROLLING' || this.remainingCapacity <= 0
    },
    remainingCapacity() {
      return Number(this.detail.remainingCapacity == null ? this.detail.capacity || 0 : this.detail.remainingCapacity)
    }
  },
  created() { this.loadData() },
  methods: {
    async loadData() {
      const id = Number(this.$route.params.id || this.$route.query.id)
      if (!id) { this.$message.error('缺少培训班次参数'); this.$router.back(); return }
      this.loading = true
      try {
        const [detailRes, sessionRes] = await Promise.all([getPublicTrainingClassDetail(id), getPublicTrainingSessions(id)])
        this.detail = detailRes.data || {}
        this.sessions = sessionRes.data || []
        if (this.isLoggedIn && this.isStudent) {
          const enrollmentRes = await getMyEnrollmentByClass(id)
          this.currentEnrollment = enrollmentRes.data || null
        }
      } finally { this.loading = false }
    },
    enrollmentStatusLabel(value) { return { PENDING: '待审核', ADMITTED: '已录取', REJECTED: '未通过', CANCELLED: '已取消' }[value] || value },
    handleEnrollmentButton() {
      if (!this.isLoggedIn) { this.$router.push({ path: '/login', query: { redirect: this.$route.fullPath }}); return }
      if (this.currentEnrollment) { this.$router.push('/my-enrollments'); return }
      if (!this.isStudent || this.enrollmentButtonDisabled) return
      this.enrollmentForm = emptyEnrollmentForm()
      this.enrollmentDialogVisible = true
      getInfo().then(res => {
        const user = res.data || {}
        this.enrollmentForm.realName = user.realName || ''
        this.enrollmentForm.organization = user.organization || ''
        this.enrollmentForm.position = user.position || ''
        if (/^1\d{10}$/.test(user.phone || '')) this.enrollmentForm.phone = user.phone
        if (/^\d{17}[0-9Xx]$/.test(user.idCard || '')) this.enrollmentForm.idCard = user.idCard
      }).catch(() => undefined)
      this.$nextTick(() => this.$refs.enrollmentForm && this.$refs.enrollmentForm.clearValidate())
    },
    submitEnrollmentForm() {
      this.$refs.enrollmentForm.validate(async valid => {
        if (!valid) return
        this.submitting = true
        try {
          await submitEnrollment(Object.assign({ trainingClassId: this.detail.id }, this.enrollmentForm))
          this.$message.success('报名申请已提交，请等待管理员审核')
          this.enrollmentDialogVisible = false
          const res = await getMyEnrollmentByClass(this.detail.id)
          this.currentEnrollment = res.data || null
        } finally { this.submitting = false }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-page { min-height: calc(100vh - 84px); padding: 26px 34px 50px; background: #f4f7f6; }
.detail-hero { display: flex; justify-content: space-between; gap: 30px; padding: 34px 38px; margin: 10px 0 22px; border-radius: 16px; color: #fff; background: linear-gradient(120deg, #153f3a, #1b705e); }
.hero-main { flex: 1; }
.category { color: #f2d18f; letter-spacing: 1px; }
.detail-hero h1 { margin: 10px 0; font-size: 30px; }
.detail-hero p { color: rgba(255,255,255,.8); line-height: 1.7; }
.hero-meta { display: flex; flex-wrap: wrap; gap: 18px; margin-top: 22px; font-size: 14px; }
.summary-card { width: 250px; padding: 22px; border-radius: 12px; color: #374151; background: #fff; line-height: 1.9; }
.summary-card .price { color: #b26b22; font-size: 28px; font-weight: 700; }
.summary-card small { display: block; color: #6b7280; line-height: 1.6; }
.summary-card .el-button { width: 100%; margin-top: 16px; }
.enrollment-form { margin-top: 20px; }
.content-grid { display: grid; grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr); gap: 20px; }
.content-grid .el-card { margin-bottom: 20px; border-radius: 12px; }
.content-grid h2 { margin-top: 0; color: #1f493f; }
.content-grid h3 { margin: 18px 0 6px; color: #1f493f; }
.content-grid h3:first-child { margin-top: 0; }
.content-grid p, .pre-line { color: #4b5563; white-space: pre-line; line-height: 1.8; }
.session-title { color: #1f493f; font-size: 16px; font-weight: 600; }
.empty-state { padding: 36px 0; color: #7f8c88; text-align: center; }
@media (max-width: 850px) { .detail-hero { flex-direction: column; } .summary-card { width: auto; } .content-grid { grid-template-columns: 1fr; } }
</style>

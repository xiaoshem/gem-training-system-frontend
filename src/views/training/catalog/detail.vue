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
          <div>总课时：{{ detail.totalHours }} 课时</div>
          <div>报名时间：</div>
          <small>{{ detail.enrollmentStart }} 至<br>{{ detail.enrollmentEnd }}</small>
          <el-button type="primary" disabled>报名将在下一阶段开放</el-button>
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
  </div>
</template>

<script>
import { getPublicTrainingClassDetail, getPublicTrainingSessions } from '@/api/training'

export default {
  name: 'TrainingDetail',
  data() { return { loading: false, detail: {}, sessions: [] } },
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
      } finally { this.loading = false }
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

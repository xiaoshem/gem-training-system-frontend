<template>
  <div class="catalog-page">
    <section class="hero">
      <div>
        <span class="eyebrow">GEM INDUSTRY TRAINING</span>
        <h1>人工宝石产业培训</h1>
        <p>查看已发布的培训班次，了解课程大纲、讲师、时间、地点、名额和费用。</p>
        <el-button class="portal-button" plain @click="$router.push(isLoggedIn ? '/' : '/login')">
          {{ isLoggedIn ? '返回工作台' : '登录或注册' }}
        </el-button>
      </div>
      <div class="search-box">
        <el-input v-model="query.keyword" clearable prefix-icon="el-icon-search" placeholder="搜索课程或培训班次" @keyup.enter.native="search" />
        <el-button type="primary" @click="search">搜索</el-button>
      </div>
    </section>

    <section v-loading="loading" class="catalog-content">
      <div v-if="(page.records || []).length" class="card-grid">
        <article v-for="item in page.records" :key="item.id" class="training-card" @click="openDetail(item)">
          <div class="card-cover">
            <img v-if="item.coverImage" :src="item.coverImage" alt="课程封面">
            <div v-else class="cover-placeholder"><i class="el-icon-collection" /></div>
            <span class="status-pill">{{ statusLabel(item.classStatus) }}</span>
          </div>
          <div class="card-body">
            <div class="category">{{ item.courseCategory }}</div>
            <h3>{{ item.className }}</h3>
            <p class="course-name">{{ item.courseName }}</p>
            <div class="meta"><i class="el-icon-user" /> {{ item.instructorName }}</div>
            <div class="meta"><i class="el-icon-date" /> {{ item.startDate }} 至 {{ item.endDate }}</div>
            <div class="meta"><i class="el-icon-location-outline" /> {{ item.location }}</div>
            <div class="card-footer">
              <strong>¥{{ item.fee }}</strong>
              <span>限额 {{ item.capacity }} 人</span>
            </div>
          </div>
        </article>
      </div>
      <div v-else-if="!loading" class="empty-state">暂无已发布的培训班次</div>

      <div class="pagination-wrap">
        <el-pagination
          background
          :current-page="page.current || 1"
          :page-size="page.size || query.pageSize"
          :total="page.total || 0"
          layout="total, prev, pager, next"
          @current-change="changePage"
        />
      </div>
    </section>
  </div>
</template>

<script>
import { getPublicTrainingClasses } from '@/api/training'
import { getToken } from '@/utils/auth'

export default {
  name: 'TrainingCatalog',
  data() { return { loading: false, query: { pageNum: 1, pageSize: 9, keyword: '' }, page: { records: [], total: 0 } } },
  computed: { isLoggedIn() { return Boolean(getToken()) } },
  created() { this.loadData() },
  methods: {
    async loadData() {
      this.loading = true
      try { const res = await getPublicTrainingClasses(this.query); this.page = res.data || { records: [], total: 0 } } finally { this.loading = false }
    },
    search() { this.query.pageNum = 1; this.loadData() },
    changePage(page) { this.query.pageNum = page; this.loadData() },
    statusLabel(value) { return { PLANNED: '即将报名', ENROLLING: '报名中', UPCOMING: '即将开课', IN_PROGRESS: '进行中', COMPLETED: '已结课' }[value] || value },
    openDetail(item) {
      if (this.$route.path === '/training') this.$router.push(`/training/${item.id}`)
      else this.$router.push({ path: '/training-detail', query: { id: item.id }})
    }
  }
}
</script>

<style lang="scss" scoped>
.catalog-page { min-height: calc(100vh - 84px); padding: 28px; background: #f4f7f6; }
.hero { display: flex; justify-content: space-between; align-items: flex-end; padding: 32px 38px; margin-bottom: 24px; color: #fff; border-radius: 16px; background: linear-gradient(120deg, #123f3a, #18745e 62%, #c6994b); box-shadow: 0 14px 38px rgba(18, 63, 58, .18); }
.eyebrow { font-size: 12px; letter-spacing: 2px; color: #f5d99b; }
.hero h1 { margin: 10px 0; font-size: 30px; }
.hero p { margin: 0; color: rgba(255,255,255,.82); }
.portal-button { margin-top: 18px; color: #174c40; border-color: rgba(255,255,255,.8); }
.search-box { display: flex; width: 390px; gap: 10px; }
.catalog-content { min-height: 280px; }
.card-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
.training-card { overflow: hidden; border-radius: 14px; background: #fff; box-shadow: 0 8px 25px rgba(31,41,55,.08); cursor: pointer; transition: transform .2s, box-shadow .2s; }
.training-card:hover { transform: translateY(-4px); box-shadow: 0 14px 32px rgba(31,41,55,.14); }
.card-cover { position: relative; height: 145px; background: linear-gradient(135deg, #dbece6, #f4e7c8); }
.card-cover img { width: 100%; height: 100%; object-fit: cover; }
.cover-placeholder { display: flex; height: 100%; align-items: center; justify-content: center; color: #28745f; font-size: 46px; }
.status-pill { position: absolute; top: 12px; right: 12px; padding: 5px 10px; border-radius: 14px; color: #fff; background: rgba(18,63,58,.88); font-size: 12px; }
.card-body { padding: 18px; }
.category { color: #b07825; font-size: 12px; }
.card-body h3 { margin: 7px 0; color: #1f2937; font-size: 18px; }
.course-name { margin: 0 0 14px; color: #4b5563; }
.meta { margin-top: 8px; color: #6b7280; font-size: 13px; }
.card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 15px; margin-top: 15px; border-top: 1px solid #edf0ef; }
.card-footer strong { color: #b26b22; font-size: 20px; }
.card-footer span { color: #6b7280; font-size: 13px; }
.empty-state { padding: 72px 0; color: #7f8c88; text-align: center; }
.pagination-wrap { margin-top: 28px; text-align: center; }
@media (max-width: 1100px) { .card-grid { grid-template-columns: repeat(2, minmax(0,1fr)); } .hero { align-items: flex-start; flex-direction: column; gap: 22px; } }
@media (max-width: 700px) { .card-grid { grid-template-columns: 1fr; } .search-box { width: 100%; } }
</style>

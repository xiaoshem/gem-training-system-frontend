<template>
  <div class="app-container training-page">
    <div class="page-heading">
      <div>
        <h2>课程管理</h2>
        <p>维护人工宝石培训课程的大纲、课时、技能指标和讲师。</p>
      </div>
      <el-button type="primary" icon="el-icon-plus" @click="openCreate">新增课程</el-button>
    </div>

    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" @submit.native.prevent>
        <el-form-item label="关键词">
          <el-input v-model="query.keyword" clearable placeholder="课程名称、编码或类别" @keyup.enter.native="loadData" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" clearable placeholder="全部状态">
            <el-option label="启用" value="ENABLED" />
            <el-option label="停用" value="DISABLED" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-table v-loading="loading" :data="page.records || []" border>
      <el-table-column prop="courseCode" label="课程编码" width="130" />
      <el-table-column prop="courseName" label="课程名称" min-width="180" show-overflow-tooltip />
      <el-table-column prop="courseCategory" label="类别" width="120" />
      <el-table-column prop="totalHours" label="课时" width="80" align="center" />
      <el-table-column prop="instructorNames" label="授课讲师" min-width="150" show-overflow-tooltip>
        <template slot-scope="scope">{{ scope.row.instructorNames || '未设置' }}</template>
      </el-table-column>
      <el-table-column prop="targetAudience" label="适用对象" min-width="160" show-overflow-tooltip />
      <el-table-column label="状态" width="90" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 'ENABLED' ? 'success' : 'info'">
            {{ scope.row.status === 'ENABLED' ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="showDetail(scope.row)">查看</el-button>
          <el-button type="text" @click="openEdit(scope.row)">编辑</el-button>
          <el-button type="text" class="danger-text" @click="remove(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        :current-page="page.current || 1"
        :page-size="page.size || query.pageSize"
        :page-sizes="[10, 20, 30, 50]"
        :total="page.total || 0"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="changeSize"
        @current-change="changePage"
      />
    </div>

    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="760px" :close-on-click-modal="false">
      <el-form ref="courseForm" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="18">
          <el-col :span="12">
            <el-form-item label="课程编码" prop="courseCode">
              <el-input v-model.trim="form.courseCode" maxlength="32" placeholder="如 GEM-ROBOT-001" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课程名称" prop="courseName">
              <el-input v-model.trim="form.courseName" maxlength="100" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="课程类别" prop="courseCategory">
              <el-input v-model.trim="form.courseCategory" maxlength="50" placeholder="如智能制造、宝石检测" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="总课时" prop="totalHours">
              <el-input-number v-model="form.totalHours" :min="1" :max="9999" controls-position="right" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="默认讲师">
              <el-select v-model="form.defaultInstructorId" clearable filterable style="width:100%">
                <el-option v-for="item in instructors" :key="item.userId" :label="item.realName" :value="item.userId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="授课讲师">
              <el-select v-model="form.instructorIds" multiple clearable filterable style="width:100%">
                <el-option v-for="item in instructors" :key="item.userId" :label="item.realName" :value="item.userId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="适用对象" prop="targetAudience">
              <el-input v-model.trim="form.targetAudience" maxlength="500" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="ENABLED">启用</el-radio>
                <el-radio label="DISABLED">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="课程简介">
          <el-input v-model="form.courseDescription" type="textarea" :rows="2" maxlength="1000" show-word-limit />
        </el-form-item>
        <el-form-item label="课程大纲" prop="syllabus">
          <el-input v-model="form.syllabus" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="前置要求">
          <el-input v-model="form.prerequisites" type="textarea" :rows="2" maxlength="1000" />
        </el-form-item>
        <el-form-item label="技能指标">
          <el-input v-model="form.skillIndicators" type="textarea" :rows="3" placeholder="每行一项技能指标" />
        </el-form-item>
        <el-form-item label="评分细则">
          <el-input v-model="form.scoringRules" type="textarea" :rows="3" placeholder="说明理论与实操评分要求" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </div>
    </el-dialog>

    <el-dialog title="课程详情" :visible.sync="detailVisible" width="700px">
      <div v-if="detail.id" class="detail-grid">
        <div><label>课程编码</label><span>{{ detail.courseCode }}</span></div>
        <div><label>课程类别</label><span>{{ detail.courseCategory }}</span></div>
        <div class="full"><label>课程名称</label><span>{{ detail.courseName }}</span></div>
        <div><label>总课时</label><span>{{ detail.totalHours }}</span></div>
        <div><label>讲师</label><span>{{ detail.instructorNames || '未设置' }}</span></div>
        <div class="full"><label>适用对象</label><span>{{ detail.targetAudience }}</span></div>
        <div class="full"><label>课程简介</label><span class="pre-line">{{ detail.courseDescription || '无' }}</span></div>
        <div class="full"><label>课程大纲</label><span class="pre-line">{{ detail.syllabus }}</span></div>
        <div class="full"><label>技能指标</label><span class="pre-line">{{ detail.skillIndicators || '无' }}</span></div>
        <div class="full"><label>评分细则</label><span class="pre-line">{{ detail.scoringRules || '无' }}</span></div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addCourse, deleteCourse, getCourseDetail, getCoursePage, getInstructorOptions, updateCourse } from '@/api/training'

const emptyForm = () => ({
  courseCode: '', courseName: '', courseCategory: '', courseDescription: '', coverImage: '',
  syllabus: '', totalHours: 1, targetAudience: '', prerequisites: '', defaultInstructorId: null,
  instructorIds: [], skillIndicators: '', scoringRules: '', status: 'ENABLED'
})

export default {
  name: 'CourseManagement',
  data() {
    return {
      loading: false,
      saving: false,
      page: { records: [], total: 0 },
      query: { pageNum: 1, pageSize: 10, keyword: '', status: '' },
      instructors: [],
      dialogVisible: false,
      detailVisible: false,
      editingId: null,
      form: emptyForm(),
      detail: {},
      rules: {
        courseCode: [{ required: true, message: '请输入课程编码', trigger: 'blur' }],
        courseName: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
        courseCategory: [{ required: true, message: '请输入课程类别', trigger: 'blur' }],
        totalHours: [{ required: true, message: '请输入总课时', trigger: 'change' }],
        targetAudience: [{ required: true, message: '请输入适用对象', trigger: 'blur' }],
        syllabus: [{ required: true, message: '请输入课程大纲', trigger: 'blur' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }]
      }
    }
  },
  computed: {
    dialogTitle() { return this.editingId ? '编辑课程' : '新增课程' }
  },
  created() {
    this.loadData()
    this.loadInstructors()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const res = await getCoursePage(this.query)
        this.page = res.data || { records: [], total: 0 }
      } finally {
        this.loading = false
      }
    },
    async loadInstructors() {
      const res = await getInstructorOptions()
      this.instructors = res.data || []
    },
    search() { this.query.pageNum = 1; this.loadData() },
    resetQuery() { this.query = { pageNum: 1, pageSize: 10, keyword: '', status: '' }; this.loadData() },
    changeSize(size) { this.query.pageSize = size; this.query.pageNum = 1; this.loadData() },
    changePage(page) { this.query.pageNum = page; this.loadData() },
    openCreate() {
      this.editingId = null
      this.form = emptyForm()
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.courseForm && this.$refs.courseForm.clearValidate())
    },
    async openEdit(row) {
      const res = await getCourseDetail(row.id)
      this.editingId = row.id
      this.form = Object.assign(emptyForm(), res.data, { instructorIds: res.data.instructorIds || [] })
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.courseForm && this.$refs.courseForm.clearValidate())
    },
    async showDetail(row) {
      const res = await getCourseDetail(row.id)
      this.detail = res.data || {}
      this.detailVisible = true
    },
    save() {
      this.$refs.courseForm.validate(async valid => {
        if (!valid) return
        this.saving = true
        try {
          if (this.editingId) await updateCourse(this.editingId, this.form)
          else await addCourse(this.form)
          this.$message.success('保存成功')
          this.dialogVisible = false
          await this.loadData()
        } finally {
          this.saving = false
        }
      })
    },
    remove(row) {
      this.$confirm(`确定删除课程“${row.courseName}”吗？`, '提示', { type: 'warning' })
        .then(() => deleteCourse(row.id))
        .then(() => { this.$message.success('删除成功'); this.loadData() })
        .catch(() => undefined)
    }
  }
}
</script>

<style lang="scss" scoped>
.training-page { background: #f6f8fb; min-height: calc(100vh - 84px); }
.page-heading { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.page-heading h2 { margin: 0 0 8px; color: #1f2937; }
.page-heading p { margin: 0; color: #6b7280; }
.filter-card { margin-bottom: 16px; }
.filter-card ::v-deep .el-card__body { padding-bottom: 2px; }
.pagination-container { padding: 20px 0 0; text-align: right; }
.danger-text { color: #f56c6c; }
.pre-line { white-space: pre-line; line-height: 1.7; }
.detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border: 1px solid #ebeef5; border-bottom: 0; border-right: 0; }
.detail-grid > div { display: flex; min-height: 42px; border-right: 1px solid #ebeef5; border-bottom: 1px solid #ebeef5; }
.detail-grid > .full { grid-column: 1 / -1; }
.detail-grid label { flex: 0 0 92px; padding: 12px; color: #606266; background: #f5f7fa; font-weight: 600; }
.detail-grid span { padding: 12px; color: #303133; }
</style>

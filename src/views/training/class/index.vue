<template>
  <div class="app-container training-page">
    <div class="page-heading">
      <div>
        <h2>{{ isAdmin ? '培训班次' : '我的授课' }}</h2>
        <p>{{ isAdmin ? '创建班次、安排课次并控制发布状态。' : '查看由你主讲或参与授课的培训安排。' }}</p>
      </div>
      <el-button v-if="isAdmin" type="primary" icon="el-icon-plus" @click="openCreate">新增班次</el-button>
    </div>

    <el-card shadow="never" class="filter-card">
      <el-form :inline="true">
        <el-form-item label="关键词">
          <el-input v-model="query.keyword" clearable placeholder="班次名称、编码或课程" @keyup.enter.native="search" />
        </el-form-item>
        <el-form-item label="发布状态">
          <el-select v-model="query.publishStatus" clearable placeholder="全部">
            <el-option label="草稿" value="DRAFT" />
            <el-option label="已发布" value="PUBLISHED" />
          </el-select>
        </el-form-item>
        <el-form-item label="班次状态">
          <el-select v-model="query.classStatus" clearable placeholder="全部">
            <el-option v-for="item in classStatuses" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-table v-loading="loading" :data="page.records || []" border>
      <el-table-column prop="classCode" label="班次编码" width="145" />
      <el-table-column prop="className" label="班次名称" min-width="210" show-overflow-tooltip />
      <el-table-column prop="courseName" label="课程" min-width="170" show-overflow-tooltip />
      <el-table-column prop="instructorName" label="主讲师" width="110" />
      <el-table-column label="培训日期" width="190" align="center">
        <template slot-scope="scope">{{ scope.row.startDate }} 至 {{ scope.row.endDate }}</template>
      </el-table-column>
      <el-table-column prop="location" label="地点" min-width="150" show-overflow-tooltip />
      <el-table-column label="名额/费用" width="125" align="center">
        <template slot-scope="scope">{{ scope.row.capacity }}人 / ¥{{ scope.row.fee }}</template>
      </el-table-column>
      <el-table-column label="发布" width="90" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.publishStatus === 'PUBLISHED' ? 'success' : 'info'">
            {{ scope.row.publishStatus === 'PUBLISHED' ? '已发布' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90" align="center">
        <template slot-scope="scope"><el-tag :type="statusType(scope.row)">{{ statusLabel(scope.row) }}</el-tag></template>
      </el-table-column>
      <el-table-column label="操作" width="300" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="openSessions(scope.row)">课次（{{ scope.row.sessionCount || 0 }}）</el-button>
          <template v-if="isAdmin">
            <el-button v-if="canEditDraft(scope.row)" type="text" @click="openEdit(scope.row)">编辑</el-button>
            <el-button v-if="canPublishDraft(scope.row)" type="text" class="success-text" @click="publishRow(scope.row)">发布</el-button>
            <el-button v-if="scope.row.publishStatus === 'PUBLISHED' && ['PLANNED','ENROLLING'].includes(scope.row.classStatus)" type="text" @click="unpublishRow(scope.row)">撤回</el-button>
            <el-button v-if="scope.row.publishStatus === 'PUBLISHED' && ['PLANNED','ENROLLING','UPCOMING'].includes(scope.row.classStatus)" type="text" class="warning-text" @click="cancelRow(scope.row)">取消开班</el-button>
            <el-button v-if="scope.row.publishStatus === 'DRAFT'" type="text" class="danger-text" @click="remove(scope.row)">删除</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        :current-page="page.current || 1"
        :page-size="page.size || query.pageSize"
        :page-sizes="[10, 20, 30]"
        :total="page.total || 0"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="changeSize"
        @current-change="changePage"
      />
    </div>

    <el-dialog :title="editingId ? '编辑培训班次' : '新增培训班次'" :visible.sync="dialogVisible" width="780px" :close-on-click-modal="false">
      <el-form ref="classForm" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="18">
          <el-col :span="12">
            <el-form-item label="班次编码" prop="classCode">
              <el-input v-model.trim="form.classCode" maxlength="32" placeholder="如 GEM-ROBOT-2026-03" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="班次名称" prop="className">
              <el-input v-model.trim="form.className" maxlength="150" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="培训课程" prop="courseId">
              <el-select v-model="form.courseId" filterable style="width:100%">
                <el-option v-for="item in courses" :key="item.id" :label="`${item.courseName}（${item.courseCode}）`" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主讲师" prop="instructorId">
              <el-select v-model="form.instructorId" filterable style="width:100%">
                <el-option v-for="item in instructors" :key="item.userId" :label="item.realName" :value="item.userId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报名开始" prop="enrollmentStart">
              <el-date-picker v-model="form.enrollmentStart" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" :picker-options="registrationDateOptions" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="报名结束" prop="enrollmentEnd">
              <el-date-picker v-model="form.enrollmentEnd" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" :picker-options="registrationDateOptions" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开课日期" prop="startDate">
              <el-date-picker v-model="form.startDate" type="date" value-format="yyyy-MM-dd" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结课日期" prop="endDate">
              <el-date-picker v-model="form.endDate" type="date" value-format="yyyy-MM-dd" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="上课地点" prop="location">
              <el-input v-model.trim="form.location" maxlength="255" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="招生名额" prop="capacity">
              <el-input-number v-model="form.capacity" :min="1" :max="9999" controls-position="right" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="培训费用" prop="fee">
              <el-input-number v-model="form.fee" :min="0" :precision="2" :step="100" controls-position="right" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-alert title="保存后先进入“课次安排”添加课次，至少有一个课次才能发布。" type="info" :closable="false" />
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" :disabled="hasInvalidEnrollmentPeriod" @click="save">保存草稿</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  addTrainingClass, cancelTrainingClass, deleteTrainingClass, getCourseOptions,
  getInstructorOptions, getTrainingClassPage, publishTrainingClass,
  unpublishTrainingClass, updateTrainingClass
} from '@/api/training'

const parseDateTime = value => new Date(String(value).replace(/-/g, '/'))
const startOfToday = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}
const hasExpiredEnrollmentPeriod = target => {
  const startInvalid = target.enrollmentStart && parseDateTime(target.enrollmentStart).getTime() < startOfToday().getTime()
  const endInvalid = target.enrollmentEnd && parseDateTime(target.enrollmentEnd).getTime() <= Date.now()
  return Boolean(startInvalid || endInvalid)
}
const validateEnrollmentStart = (rule, value, callback) => {
  if (value && parseDateTime(value).getTime() < startOfToday().getTime()) {
    callback(new Error('报名开始日期不能早于今天'))
    return
  }
  callback()
}
const validateEnrollmentEnd = (rule, value, callback) => {
  if (value && parseDateTime(value).getTime() <= Date.now()) {
    callback(new Error('报名结束时间必须晚于当前时间'))
    return
  }
  callback()
}

const emptyForm = () => ({
  classCode: '', courseId: null, className: '', instructorId: null,
  enrollmentStart: '', enrollmentEnd: '', startDate: '', endDate: '',
  location: '', capacity: 30, fee: 0
})

export default {
  name: 'TrainingClassManagement',
  data() {
    return {
      loading: false, saving: false,
      page: { records: [], total: 0 },
      query: { pageNum: 1, pageSize: 10, keyword: '', classStatus: '', publishStatus: '' },
      courses: [], instructors: [], dialogVisible: false, editingId: null, form: emptyForm(),
      registrationDateOptions: {
        disabledDate(time) { return time.getTime() < startOfToday().getTime() }
      },
      classStatuses: [
        { value: 'PLANNED', label: '未到报名' }, { value: 'ENROLLING', label: '报名中' },
        { value: 'UPCOMING', label: '待开课' }, { value: 'IN_PROGRESS', label: '进行中' },
        { value: 'COMPLETED', label: '已结课' }, { value: 'EXPIRED', label: '已过期' },
        { value: 'CANCELLED', label: '已取消' }
      ],
      rules: {
        classCode: [{ required: true, message: '请输入班次编码', trigger: 'blur' }],
        className: [{ required: true, message: '请输入班次名称', trigger: 'blur' }],
        courseId: [{ required: true, message: '请选择培训课程', trigger: 'change' }],
        instructorId: [{ required: true, message: '请选择主讲师', trigger: 'change' }],
        enrollmentStart: [
          { required: true, message: '请选择报名开始时间', trigger: 'change' },
          { validator: validateEnrollmentStart, trigger: 'change' }
        ],
        enrollmentEnd: [
          { required: true, message: '请选择报名结束时间', trigger: 'change' },
          { validator: validateEnrollmentEnd, trigger: 'change' }
        ],
        startDate: [{ required: true, message: '请选择开课日期', trigger: 'change' }],
        endDate: [{ required: true, message: '请选择结课日期', trigger: 'change' }],
        location: [{ required: true, message: '请输入上课地点', trigger: 'blur' }],
        capacity: [{ required: true, message: '请输入招生名额', trigger: 'change' }],
        fee: [{ required: true, message: '请输入培训费用', trigger: 'change' }]
      }
    }
  },
  computed: {
    isAdmin() { return sessionStorage.getItem('roles') === 'admin' },
    hasInvalidEnrollmentPeriod() {
      return hasExpiredEnrollmentPeriod(this.form)
    }
  },
  created() {
    this.loadData()
    if (this.isAdmin) this.loadOptions()
  },
  methods: {
    async loadData() {
      this.loading = true
      try { const res = await getTrainingClassPage(this.query); this.page = res.data || { records: [], total: 0 } } finally { this.loading = false }
    },
    async loadOptions() {
      const [courseRes, instructorRes] = await Promise.all([getCourseOptions(), getInstructorOptions()])
      this.courses = courseRes.data || []
      this.instructors = instructorRes.data || []
    },
    search() { this.query.pageNum = 1; this.loadData() },
    resetQuery() { this.query = { pageNum: 1, pageSize: 10, keyword: '', classStatus: '', publishStatus: '' }; this.loadData() },
    changeSize(size) { this.query.pageSize = size; this.query.pageNum = 1; this.loadData() },
    changePage(page) { this.query.pageNum = page; this.loadData() },
    statusLabel(row) {
      if (row.publishStatus === 'DRAFT' && row.classStatus === 'PLANNED') return '未生效'
      const item = this.classStatuses.find(it => it.value === row.classStatus)
      return item ? item.label : row.classStatus
    },
    statusType(row) { return { ENROLLING: 'success', IN_PROGRESS: 'warning', EXPIRED: 'warning', COMPLETED: '', CANCELLED: 'danger' }[row.classStatus] || 'info' },
    canEditDraft(row) { return row.publishStatus === 'DRAFT' && row.classStatus === 'PLANNED' },
    canPublishDraft(row) {
      return this.canEditDraft(row) && Boolean(row.enrollmentStart && row.enrollmentEnd) &&
        !hasExpiredEnrollmentPeriod(row) && Number(row.activeSessionCount || 0) > 0
    },
    openCreate() { this.editingId = null; this.form = emptyForm(); this.dialogVisible = true; this.$nextTick(() => this.$refs.classForm && this.$refs.classForm.clearValidate()) },
    openEdit(row) { this.editingId = row.id; this.form = Object.assign(emptyForm(), row); this.dialogVisible = true; this.$nextTick(() => this.$refs.classForm && this.$refs.classForm.clearValidate()) },
    save() {
      this.$refs.classForm.validate(async valid => {
        if (!valid) return
        this.saving = true
        try {
          if (this.editingId) await updateTrainingClass(this.editingId, this.form)
          else await addTrainingClass(this.form)
          this.$message.success('草稿保存成功')
          this.dialogVisible = false
          await this.loadData()
        } finally { this.saving = false }
      })
    },
    openSessions(row) { this.$router.push({ path: '/training-sessions', query: { classId: row.id, className: row.className, editable: this.canEditDraft(row) ? '1' : '0' }}) },
    publishRow(row) { this.confirmAction(`发布“${row.className}”吗？`, () => publishTrainingClass(row.id), '发布成功') },
    unpublishRow(row) { this.confirmAction(`将“${row.className}”撤回为草稿吗？`, () => unpublishTrainingClass(row.id), '已撤回') },
    cancelRow(row) { this.confirmAction(`确定取消“${row.className}”吗？`, () => cancelTrainingClass(row.id), '班次已取消') },
    remove(row) { this.confirmAction(`确定删除草稿“${row.className}”及其课次吗？`, () => deleteTrainingClass(row.id), '删除成功') },
    confirmAction(message, action, success) {
      this.$confirm(message, '提示', { type: 'warning' })
        .then(action).then(() => { this.$message.success(success); this.loadData() }).catch(() => undefined)
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
.pagination-container { padding-top: 20px; text-align: right; }
.success-text { color: #67c23a; }
.warning-text { color: #e6a23c; }
.danger-text { color: #f56c6c; }
</style>

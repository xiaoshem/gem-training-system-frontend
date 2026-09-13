<template>
  <div class="app-container training-page">
    <div class="page-heading">
      <div>
        <el-button type="text" icon="el-icon-back" @click="$router.back()">返回班次</el-button>
        <h2>课次安排</h2>
        <p>{{ className || '当前培训班次' }} · 按授课顺序维护时间、地点和讲师。</p>
      </div>
      <el-button v-if="canEdit" type="primary" icon="el-icon-plus" @click="openCreate">新增课次</el-button>
    </div>

    <el-alert v-if="!canEdit" title="当前班次已发布、取消，或你只有查看权限，课次安排不可编辑。" type="info" :closable="false" show-icon />

    <el-table v-loading="loading" :data="sessions" border class="session-table">
      <el-table-column prop="sessionNo" label="课次" width="80" align="center" />
      <el-table-column prop="topic" label="主题" min-width="190" />
      <el-table-column prop="content" label="授课内容" min-width="220" show-overflow-tooltip />
      <el-table-column label="时间" width="300">
        <template slot-scope="scope">{{ scope.row.startTime }} 至 {{ scope.row.endTime }}</template>
      </el-table-column>
      <el-table-column prop="location" label="地点" min-width="150" />
      <el-table-column prop="instructorName" label="讲师" width="110" />
      <el-table-column label="状态" width="90" align="center">
        <template slot-scope="scope"><el-tag :type="scope.row.status === 'CANCELLED' ? 'danger' : scope.row.status === 'COMPLETED' ? 'success' : 'info'">{{ statusLabel(scope.row.status) }}</el-tag></template>
      </el-table-column>
      <el-table-column v-if="canEdit" label="操作" width="130" fixed="right" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="openEdit(scope.row)">编辑</el-button>
          <el-button type="text" class="danger-text" @click="remove(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="!loading && sessions.length === 0" class="empty-state">还没有安排课次</div>

    <el-dialog :title="editingId ? '编辑课次' : '新增课次'" :visible.sync="dialogVisible" width="680px" :close-on-click-modal="false">
      <el-form ref="sessionForm" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="18">
          <el-col :span="8">
            <el-form-item label="课次序号" prop="sessionNo">
              <el-input-number v-model="form.sessionNo" :min="1" :max="999" controls-position="right" />
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="课次主题" prop="topic"><el-input v-model.trim="form.topic" maxlength="200" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime"><el-date-picker v-model="form.startTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" style="width:100%" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime"><el-date-picker v-model="form.endTime" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" style="width:100%" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="授课地点" prop="location"><el-input v-model.trim="form.location" maxlength="255" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="授课讲师" prop="instructorId">
              <el-select v-model="form.instructorId" filterable style="width:100%">
                <el-option v-for="item in instructors" :key="item.userId" :label="item.realName" :value="item.userId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="课次状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio label="PLANNED">计划中</el-radio>
                <el-radio label="COMPLETED">已完成</el-radio>
                <el-radio label="CANCELLED">已取消</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="授课内容"><el-input v-model="form.content" type="textarea" :rows="4" maxlength="2000" show-word-limit /></el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addTrainingSession, deleteTrainingSession, getInstructorOptions, getTrainingSessions, updateTrainingSession } from '@/api/training'

const emptyForm = classId => ({
  trainingClassId: classId, sessionNo: 1, topic: '', content: '', startTime: '', endTime: '', location: '', instructorId: null, status: 'PLANNED'
})

export default {
  name: 'TrainingSessions',
  data() {
    return {
      loading: false, saving: false, sessions: [], instructors: [], dialogVisible: false, editingId: null,
      form: emptyForm(null),
      rules: {
        sessionNo: [{ required: true, message: '请输入课次序号', trigger: 'change' }],
        topic: [{ required: true, message: '请输入课次主题', trigger: 'blur' }],
        startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
        endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
        location: [{ required: true, message: '请输入授课地点', trigger: 'blur' }],
        instructorId: [{ required: true, message: '请选择授课讲师', trigger: 'change' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }]
      }
    }
  },
  computed: {
    classId() { return Number(this.$route.query.classId) },
    className() { return this.$route.query.className || '' },
    canEdit() { return sessionStorage.getItem('roles') === 'admin' && this.$route.query.editable === '1' }
  },
  created() {
    if (!this.classId) { this.$message.error('缺少培训班次参数'); this.$router.back(); return }
    this.loadData()
    if (this.canEdit) this.loadInstructors()
  },
  methods: {
    async loadData() {
      this.loading = true
      try { const res = await getTrainingSessions(this.classId); this.sessions = res.data || [] } finally { this.loading = false }
    },
    async loadInstructors() { const res = await getInstructorOptions(); this.instructors = res.data || [] },
    statusLabel(status) { return { PLANNED: '计划中', COMPLETED: '已完成', CANCELLED: '已取消' }[status] || status },
    openCreate() {
      this.editingId = null
      this.form = emptyForm(this.classId)
      this.form.sessionNo = this.sessions.length ? Math.max.apply(null, this.sessions.map(item => item.sessionNo)) + 1 : 1
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.sessionForm && this.$refs.sessionForm.clearValidate())
    },
    openEdit(row) {
      this.editingId = row.id
      this.form = Object.assign(emptyForm(this.classId), row, { trainingClassId: this.classId })
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.sessionForm && this.$refs.sessionForm.clearValidate())
    },
    save() {
      this.$refs.sessionForm.validate(async valid => {
        if (!valid) return
        this.saving = true
        try {
          if (this.editingId) await updateTrainingSession(this.editingId, this.form)
          else await addTrainingSession(this.form)
          this.$message.success('保存成功')
          this.dialogVisible = false
          await this.loadData()
        } finally { this.saving = false }
      })
    },
    remove(row) {
      this.$confirm(`确定删除第${row.sessionNo}课次吗？`, '提示', { type: 'warning' })
        .then(() => deleteTrainingSession(row.id))
        .then(() => { this.$message.success('删除成功'); this.loadData() })
        .catch(() => undefined)
    }
  }
}
</script>

<style lang="scss" scoped>
.training-page { background: #f6f8fb; min-height: calc(100vh - 84px); }
.page-heading { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.page-heading h2 { margin: 4px 0 8px; color: #1f2937; }
.page-heading p { margin: 0; color: #6b7280; }
.session-table { margin-top: 16px; }
.empty-state { padding: 44px 0; color: #909399; text-align: center; }
.danger-text { color: #f56c6c; }
</style>

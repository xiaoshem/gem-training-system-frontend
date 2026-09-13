<template>
  <div class="app-container training-page">
    <div class="page-heading">
      <div>
        <h2>讲师档案</h2>
        <p>从培训讲师账号中建立专业档案，供课程和课次选择。</p>
      </div>
      <el-button type="primary" icon="el-icon-plus" @click="openCreate">新增档案</el-button>
    </div>

    <el-card shadow="never" class="filter-card">
      <el-form :inline="true">
        <el-form-item label="关键词">
          <el-input v-model="query.keyword" clearable placeholder="姓名、账号或擅长领域" @keyup.enter.native="search" />
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
      <el-table-column prop="realName" label="姓名" width="110" />
      <el-table-column prop="userName" label="账号" width="130" />
      <el-table-column prop="professionalTitle" label="职称" width="140">
        <template slot-scope="scope">{{ scope.row.professionalTitle || '未填写' }}</template>
      </el-table-column>
      <el-table-column prop="specialties" label="擅长领域" min-width="180" show-overflow-tooltip />
      <el-table-column prop="qualificationCertificate" label="资质证书" min-width="180" show-overflow-tooltip />
      <el-table-column prop="organization" label="单位" min-width="150" show-overflow-tooltip>
        <template slot-scope="scope">{{ scope.row.organization || '未填写' }}</template>
      </el-table-column>
      <el-table-column prop="position" label="岗位" min-width="130" show-overflow-tooltip>
        <template slot-scope="scope">{{ scope.row.position || '未填写' }}</template>
      </el-table-column>
      <el-table-column prop="phone" label="联系电话" width="125">
        <template slot-scope="scope">{{ scope.row.phone || '未填写' }}</template>
      </el-table-column>
      <el-table-column label="状态" width="90" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 'ENABLED' ? 'success' : 'info'">
            {{ scope.row.status === 'ENABLED' ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="130" fixed="right" align="center">
        <template slot-scope="scope">
          <el-button type="text" @click="openEdit(scope.row)">编辑</el-button>
          <el-button type="text" class="danger-text" @click="remove(scope.row)">删除</el-button>
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

    <el-dialog :title="editingId ? '编辑讲师档案' : '新增讲师档案'" :visible.sync="dialogVisible" width="720px" :close-on-click-modal="false">
      <el-form ref="instructorForm" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="讲师账号" prop="userId">
          <el-select v-model="form.userId" :disabled="Boolean(editingId)" filterable style="width:100%" placeholder="请选择角色为培训讲师的用户" @change="syncCandidateBaseInfo">
            <el-option
              v-for="item in candidates"
              :key="item.userId"
              :disabled="item.status !== 'UNCREATED' && item.userId !== form.userId"
              :label="`${item.realName || item.userName}（${item.userName}）${item.status === 'UNCREATED' ? '' : ' - 已建档'}`"
              :value="item.userId"
            />
          </el-select>
        </el-form-item>
        <el-row :gutter="18">
          <el-col :span="12">
            <el-form-item label="职称">
              <el-input v-model.trim="form.professionalTitle" maxlength="100" />
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
        <el-form-item label="擅长领域">
          <el-input v-model="form.specialties" maxlength="500" placeholder="例如：智能打磨、人工宝石检测" />
        </el-form-item>
        <el-form-item label="资质证书">
          <el-input v-model="form.qualificationCertificate" maxlength="500" />
        </el-form-item>
        <el-row :gutter="18">
          <el-col :span="12">
            <el-form-item label="所在单位">
              <el-input v-model.trim="form.organization" maxlength="150" placeholder="企业、学校或培训机构" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位">
              <el-input v-model.trim="form.position" maxlength="100" placeholder="例如：实训讲师" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model.trim="form.phone" maxlength="11" placeholder="11位手机号码，可选" />
        </el-form-item>
        <el-form-item label="讲师简介">
          <el-input v-model="form.introduction" type="textarea" :rows="5" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { addInstructor, deleteInstructor, getInstructorCandidates, getInstructorPage, updateInstructor } from '@/api/training'

const emptyForm = () => ({
  userId: null, professionalTitle: '', specialties: '', qualificationCertificate: '', organization: '', position: '', phone: '', introduction: '', status: 'ENABLED'
})

export default {
  name: 'InstructorManagement',
  data() {
    return {
      loading: false,
      saving: false,
      page: { records: [], total: 0 },
      query: { pageNum: 1, pageSize: 10, keyword: '', status: '' },
      candidates: [],
      dialogVisible: false,
      editingId: null,
      form: emptyForm(),
      rules: {
        userId: [{ required: true, message: '请选择讲师账号', trigger: 'change' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }],
        phone: [{ pattern: /^$|^1\d{10}$/, message: '请输入正确的11位手机号码', trigger: 'blur' }]
      }
    }
  },
  created() { this.loadData(); this.loadCandidates() },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const res = await getInstructorPage(this.query)
        this.page = res.data || { records: [], total: 0 }
      } finally { this.loading = false }
    },
    async loadCandidates() {
      const res = await getInstructorCandidates()
      this.candidates = res.data || []
    },
    search() { this.query.pageNum = 1; this.loadData() },
    resetQuery() { this.query = { pageNum: 1, pageSize: 10, keyword: '', status: '' }; this.loadData() },
    changeSize(size) { this.query.pageSize = size; this.query.pageNum = 1; this.loadData() },
    changePage(page) { this.query.pageNum = page; this.loadData() },
    openCreate() {
      this.editingId = null
      this.form = emptyForm()
      this.dialogVisible = true
      this.loadCandidates()
      this.$nextTick(() => this.$refs.instructorForm && this.$refs.instructorForm.clearValidate())
    },
    openEdit(row) {
      this.editingId = row.id
      this.form = Object.assign(emptyForm(), row)
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.instructorForm && this.$refs.instructorForm.clearValidate())
    },
    syncCandidateBaseInfo(userId) {
      const candidate = this.candidates.find(item => item.userId === userId)
      if (candidate) {
        this.form.organization = candidate.organization || ''
        this.form.position = candidate.position || ''
        this.form.phone = candidate.phone || ''
      }
    },
    save() {
      this.$refs.instructorForm.validate(async valid => {
        if (!valid) return
        this.saving = true
        try {
          if (this.editingId) await updateInstructor(this.editingId, this.form)
          else await addInstructor(this.form)
          this.$message.success('保存成功')
          this.dialogVisible = false
          await Promise.all([this.loadData(), this.loadCandidates()])
        } finally { this.saving = false }
      })
    },
    remove(row) {
      this.$confirm(`确定删除讲师“${row.realName}”的专业档案吗？`, '提示', { type: 'warning' })
        .then(() => deleteInstructor(row.id))
        .then(() => { this.$message.success('删除成功'); return Promise.all([this.loadData(), this.loadCandidates()]) })
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
.pagination-container { padding-top: 20px; text-align: right; }
.danger-text { color: #f56c6c; }
</style>

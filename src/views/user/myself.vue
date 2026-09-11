<template>
  <div class="item-contain">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>个人信息</span>
        <div class="header-actions">
          <el-button type="text" size="mini" @click="openProfileDialog">编辑资料</el-button>
          <el-button type="text" size="mini" @click="fileDialogVisible = true">编辑头像</el-button>
          <el-button
            v-if="isStudent && data.gradeName == null"
            type="text"
            size="mini"
            @click="addClassDialogVisible = true"
          >加入班级</el-button>
          <el-button
            v-if="isStudent && data.gradeName != null"
            type="text"
            size="mini"
            @click="exitGrade"
          >退出班级</el-button>
        </div>
      </div>

      <div class="card-body">
        <div class="profile-details">
          <div class="profile-row"><span>用户名</span><strong>{{ data.userName || '—' }}</strong></div>
          <div class="profile-row"><span>真实姓名</span><strong>{{ data.realName || '—' }}</strong></div>
          <div class="profile-row"><span>当前角色</span><strong>{{ roleName }}</strong></div>
          <div class="profile-row"><span>身份证号</span><strong>{{ data.idCard || '未填写' }}</strong></div>
          <div class="profile-row"><span>所在单位</span><strong>{{ data.organization || '未填写' }}</strong></div>
          <div class="profile-row"><span>岗位</span><strong>{{ data.position || '未填写' }}</strong></div>
          <div class="profile-row"><span>联系电话</span><strong>{{ data.phone || '未填写' }}</strong></div>
          <div v-if="isStudent" class="profile-row">
            <span>当前班级</span><strong>{{ data.gradeName || '暂未加入班级' }}</strong>
          </div>
        </div>
        <div class="avatar-panel">
          <el-avatar :size="150" :src="data.avatar" icon="el-icon-user-solid" />
          <div class="privacy-note">身份证号和联系电话仅以脱敏形式展示</div>
        </div>
      </div>
    </el-card>

    <el-dialog title="编辑个人资料" width="520px" :visible.sync="profileDialogVisible">
      <el-form ref="profileForm" :model="profileForm" :rules="profileRules" label-width="110px">
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="profileForm.realName" maxlength="50" />
        </el-form-item>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="profileForm.idCard" placeholder="留空表示不修改" maxlength="18" />
        </el-form-item>
        <el-form-item label="所在企业或单位" prop="organization">
          <el-input v-model="profileForm.organization" maxlength="150" />
        </el-form-item>
        <el-form-item label="岗位" prop="position">
          <el-input v-model="profileForm.position" maxlength="100" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="profileForm.phone" placeholder="留空表示不修改" maxlength="11" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="profileDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="profileSaving" @click="saveProfile">保存</el-button>
      </div>
    </el-dialog>

    <el-dialog
      width="400px"
      :show-close="false"
      :close-on-click-modal="false"
      title="上传头像"
      :visible.sync="fileDialogVisible"
    >
      <el-upload
        class="upload-demo"
        drag
        action="xxxxxx"
        :limit="1"
        accept=".png,.jpg,.jpeg,.bmp"
        :auto-upload="false"
        :on-remove="handleRemove"
        :on-change="handleFileChange"
        :file-list="fileList"
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div slot="tip" class="el-upload__tip">支持 png、jpg、jpeg、bmp，文件不超过 2MB</div>
      </el-upload>
      <div slot="footer">
        <el-button @click="fileDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="importAvatar">确定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="加入班级" width="480px" :visible.sync="addClassDialogVisible">
      <el-form :model="joinForm" label-width="90px">
        <el-form-item label="班级口令">
          <el-input v-model="joinForm.code" autocomplete="off" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="addClassDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addClass">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { exitUserGrade, getInfo, updateProfile, userAddClass, uploadAvatar } from '@/api/user'
import { getRole } from '@/utils/jwtUtils'

export default {
  name: 'Myself',
  data() {
    const validateIdCard = (rule, value, callback) => {
      if (value && !/^\d{17}[0-9Xx]$/.test(value)) {
        callback(new Error('请输入正确的18位身份证号'))
      } else {
        callback()
      }
    }
    const validatePhone = (rule, value, callback) => {
      if (value && !/^1\d{10}$/.test(value)) {
        callback(new Error('请输入正确的11位手机号'))
      } else {
        callback()
      }
    }
    return {
      roleId: 0,
      data: {},
      fileDialogVisible: false,
      fileList: [],
      addClassDialogVisible: false,
      joinForm: { code: '' },
      profileDialogVisible: false,
      profileSaving: false,
      profileForm: {
        realName: '',
        idCard: '',
        organization: '',
        position: '',
        phone: ''
      },
      profileRules: {
        realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
        idCard: [{ validator: validateIdCard, trigger: 'blur' }],
        organization: [{ max: 150, message: '所在企业或单位不能超过150个字符', trigger: 'blur' }],
        position: [{ max: 100, message: '岗位不能超过100个字符', trigger: 'blur' }],
        phone: [{ validator: validatePhone, trigger: 'blur' }]
      }
    }
  },
  computed: {
    isStudent() {
      return this.roleId === 1
    },
    roleName() {
      return {
        1: '学员',
        2: '培训讲师',
        3: '管理员',
        4: '认证审核员'
      }[this.roleId] || '未知角色'
    }
  },
  created() {
    this.roleId = getRole()
    this.getInfoFun()
  },
  methods: {
    async getInfoFun() {
      const res = await getInfo()
      if (res.code) {
        this.data = res.data
      } else {
        this.$message.error('获取个人信息失败')
      }
    },
    openProfileDialog() {
      this.profileForm = {
        realName: this.data.realName || '',
        idCard: '',
        organization: this.data.organization || '',
        position: this.data.position || '',
        phone: ''
      }
      this.profileDialogVisible = true
      this.$nextTick(() => this.$refs.profileForm && this.$refs.profileForm.clearValidate())
    },
    saveProfile() {
      this.$refs.profileForm.validate(async(valid) => {
        if (!valid) return
        this.profileSaving = true
        try {
          const res = await updateProfile(this.profileForm)
          if (res.code) {
            this.$message.success(res.msg || '个人资料修改成功')
            this.profileDialogVisible = false
            await this.getInfoFun()
          }
        } finally {
          this.profileSaving = false
        }
      })
    },
    exitGrade() {
      this.$confirm('确定退出当前班级吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const res = await exitUserGrade()
        if (res.code) {
          this.$message.success('退出成功')
          await this.getInfoFun()
        }
      }).catch(() => undefined)
    },
    handleFileChange(file, fileList) {
      this.fileList = fileList
    },
    handleRemove(file, fileList) {
      this.fileList = fileList
    },
    async importAvatar() {
      if (!this.fileList.length) {
        this.$message.warning('请选择文件后再上传')
        return
      }
      const formData = new FormData()
      formData.append('file', this.fileList[0].raw)
      const res = await uploadAvatar(formData)
      if (res.code) {
        this.$message.success('头像上传成功')
        this.fileDialogVisible = false
        this.fileList = []
        await this.getInfoFun()
      }
    },
    async addClass() {
      if (!this.joinForm.code.trim()) {
        this.$message.warning('请输入班级口令')
        return
      }
      const res = await userAddClass({ code: this.joinForm.code.trim() })
      if (res.code) {
        this.$message.success('加入成功')
        this.addClassDialogVisible = false
        this.joinForm.code = ''
        await this.getInfoFun()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.item-contain {
  min-height: calc(100vh - 84px);
  padding: 32px;
  background: #f5f7fa;
}

.box-card {
  max-width: 980px;
  margin: 0 auto;
}

.clearfix::after {
  display: table;
  clear: both;
  content: '';
}

.header-actions {
  float: right;

  .el-button {
    margin-left: 16px;
  }
}

.card-body {
  display: flex;
  min-height: 390px;
}

.profile-details {
  flex: 1;
  padding: 18px 42px 18px 12px;
  border-right: 1px solid #ebeef5;
}

.profile-row {
  display: flex;
  min-height: 43px;
  align-items: center;

  span {
    width: 130px;
    color: #909399;
  }

  strong {
    color: #303133;
    font-weight: 500;
  }
}

.avatar-panel {
  width: 280px;
  padding-top: 45px;
  text-align: center;
}

.privacy-note {
  margin-top: 24px;
  color: #909399;
  font-size: 12px;
}

@media (max-width: 760px) {
  .item-contain {
    padding: 16px;
  }

  .card-body {
    display: block;
  }

  .profile-details {
    padding-right: 12px;
    border-right: 0;
  }

  .avatar-panel {
    width: auto;
    padding: 24px 0;
  }
}
</style>

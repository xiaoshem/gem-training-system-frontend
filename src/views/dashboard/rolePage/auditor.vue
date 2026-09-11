<template>
  <div class="auditor-dashboard">
    <el-card shadow="never" class="welcome-card">
      <div class="eyebrow">CERTIFICATION REVIEW</div>
      <h1>认证审核工作台</h1>
      <p>欢迎进入人工宝石产业人才培训与技能认证管理系统。</p>
      <el-alert
        title="当前账号已启用认证审核员权限"
        description="后续证书申请、审核、发放与异常证书处理将在认证管理阶段接入此工作台。"
        type="success"
        :closable="false"
        show-icon
      />
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'AuditorDashboard'
}
</script>

<style lang="scss" scoped>
.auditor-dashboard {
  padding: 32px;
}

.welcome-card {
  max-width: 960px;
  margin: 0 auto;
  border-radius: 8px;
}

.eyebrow {
  margin-bottom: 12px;
  color: #409eff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.6px;
}

h1 {
  margin: 0 0 12px;
  color: #263238;
  font-size: 30px;
}

p {
  margin: 0 0 28px;
  color: #606266;
}
</style>

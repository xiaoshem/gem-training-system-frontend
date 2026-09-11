
<template>
  <div>
    <div>
      <com-admin v-if="url == 0" />
      <com-student v-else-if="url == 2" />
      <com-auditor v-else-if="url == 3" />
    </div>
  </div>
</template>
<script>
import comAdmin from './rolePage/adminAndTeacher.vue'
import comStudent from './rolePage/student.vue'
import comAuditor from './rolePage/auditor.vue'
export default {
  components: {
    comAdmin,
    comStudent,
    comAuditor
  },
  data() {
    return {
      url: 0

    }
  },
  created() {
    // this.url = this.$route.query.url;
    const roles = sessionStorage.getItem('roles')
    switch (roles) {
      case 'admin': {
        this.url = 0
        break
      }
      case 'teacher': {
        this.url = 0
        break
      }
      case 'student': {
        this.url = 2
        break
      }
      case 'auditor': {
        this.url = 3
        break
      }
    }
  }

}
</script>
<style scoped>

</style>

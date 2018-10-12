<template>
    <el-header class="header">
        <div class="logo">FireFilm后台管理系统</div>
        <div class="user-info">
          <el-dropdown trigger="click" @command="handleCommand">
            <span class="el-dropdown-link">
              <img class="user-logo" src="../../assets/avatar.jpg">
              {{user_info.realname}}
            </span>
            <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="logout">退出</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
    </el-header>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['user_info'])
  },
  methods: {
    handleCommand(command) {
      if (command == 'logout') {
        this.$store.commit('logout')
        localStorage.setItem('sessionid', '')
        this.$router.push('/')
      }
    }
  }
}
</script>
<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 60px;
  font-size: 22px;
  color: #fff;
  background-color: #00a3fe;
}

.header .logo {
  padding-left: 16px;
}

.user-info{
  min-width: 100px;
}

.user-info .el-dropdown-link {
  color: #fff;
  cursor: pointer;
}

.user-info .user-logo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.el-dropdown-menu__item {
  text-align: center;
}
.el-dropdown-link{
  display: flex;
  align-items: center;
}
.el-dropdown-link img{
  margin-right:20px
}
</style>

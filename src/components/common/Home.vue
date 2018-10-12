<template>
<el-container direction="vertical" style="height:100%;">
  <v-head></v-head>
  <el-container>
    <v-sidebar></v-sidebar>
    <el-main><transition name="move" mode="out-in"><router-view></router-view></transition></el-main>
  </el-container>
</el-container>
</template>

<script>
    import vHead from './Header.vue';
    import vSidebar from './Sidebar.vue';
    import { mapGetters } from 'vuex'

    export default {
        data(){
            return {

            }
        },
        components:{
            vHead, vSidebar
        },
        created(){
            this.$store.dispatch('menu')

            // let heartbeat = setInterval( () => {
            //     this.$api.common.heartbeat( this.user_info.username ).then( res => {

            //     }).catch( err => {
            //         clearInterval(heartbeat)
            //         this.$store.commit('logout')
            //         localStorage.setItem('sessionid','')
            //         this.$router.push('/')
            //     })
            // },30000)
        },
        computed: {
            ...mapGetters([
                'user_info'
            ])
        }
    }
</script>

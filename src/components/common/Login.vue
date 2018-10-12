<template>
    <div class="login-wrap">
        <div class="ms-title">后台管理系统</div>
        <div class="ms-login">
            <el-form :model="loginForm" :rules="rules" ref="loginForm" label-width="0px" class="demo-ruleForm">
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" placeholder="请输入用户名"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" placeholder="请输入密码" v-model="loginForm.password"></el-input>
                </el-form-item>
                <el-form-item prop="checkcode">
                    <div id="geetest"></div>
                </el-form-item>
                <div class="login-btn">
                    <el-button type="primary" @click="login('loginForm')">登录</el-button>
                </div>
                <p style="font-size:12px;line-height:30px;color:#999;">Tips : 你好，欢迎使用后台管理系统。</p>
            </el-form>
        </div>
    </div>
</template>

<script>
    import md5 from 'md5'

    export default {
        data: function(){
            return {
                captcha_url: '',
                geetest: {},
                loginForm: {
                    username: '',
                    password: ''
                },
                rules: {
                    username: [
                        { required: true, message: '请输入用户名', trigger: 'blur' }
                    ],
                    password: [
                        { required: true, message: '请输入密码', trigger: 'blur' }
                    ]
                }
            }
        },
        created(){
          this.initGeeTest()
        },
        methods: {
          initGeeTest(){
            const script = document.createElement('script')
            script.src = 'http://static.geetest.com/static/tools/gt.js'
            script.onload = () => {
              this.$api.public.geetest().then(data => {
                initGeetest({
                    // 以下配置参数来自服务端 SDK
                    gt: data.gt,
                    challenge: data.challenge,
                    offline: !data.success,
                    new_captcha: true
                }, captchaObj => {
                    // 这里可以调用验证实例 captchaObj 的实例方法
                    captchaObj.appendTo('#geetest')
                    this.geetest = captchaObj
                })
              })
            }
            document.body.appendChild(script)
          },
            login(formName) {
                const result = this.geetest.getValidate()
                console.log(result)
                if (!result) {
                  this.$error('请先完成认证')
                  return
                }
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.$api.public.login(this.loginForm.username, md5(this.loginForm.password), result).then( res =>{
                            this.$store.commit('token', res.token)
                            this.$store.commit('user_info',res.user)
                            localStorage.setItem('token', res.token)

                            this.$router.push('/index');
                        }).catch( err => {
                          console.log(err)
                            this.$error(err.errmsg);
                            this.geetest.reset()
                            // this.captcha()
                            // this.loginForm.checkcode = ''
                            // this.$error(err.errinfo);
                        })
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            }
        }
    }
</script>

<style scoped>
    .login-wrap{
        position: relative;
        width:100%;
        height:100%;
        background: linear-gradient(135deg, #6ff5ff 0, #006eab 100%);
    }
    .ms-title{
        position: absolute;
        top:50%;
        width:100%;
        margin-top: -230px;
        text-align: center;
        font-size:30px;
        color: #fff;

    }
    .ms-login{
        position: absolute;
        left:50%;
        top:50%;
        width:300px;
        height:250px;
        margin:-150px 0 0 -190px;
        padding:40px;
        border-radius: 5px;
        background: #fff;
    }
    .login-btn{
        text-align: center;
    }
    .login-btn button{
        width:100%;
        height:36px;
    }

    img{
        height:100%;
    }
</style>

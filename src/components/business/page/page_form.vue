<template>
    <div>
        <div class="crumbs" v-if="pageForm.pageid">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>通用页面管理</el-breadcrumb-item>
                <el-breadcrumb-item to="/page/page_list">页面列表</el-breadcrumb-item>
                <el-breadcrumb-item>页面修改</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-row>
            <el-col :span="24">
                <el-form :model="pageForm" :rules="rules" ref="pageForm" label-width="100px">
                    <el-form-item label="页面标题" prop="title">
                        <el-input v-model="pageForm.title"></el-input>
                    </el-form-item>
                    <el-form-item label="页面链接" prop="pageurl">
                        <el-input v-model="pageForm.pageurl"></el-input>
                    </el-form-item>
                    <el-form-item label="模板内容" prop="tplcontent">
                        <editor v-model="pageForm.tplcontent" @init="editorInit();" lang="html" theme="github" width="100%" height="550px"></editor>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="createPage()">{{pageForm.pageid ? '保存': '立即创建'}}</el-button>
                        <el-button @click="$refs['pageForm'].resetFields()">重置</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import editor from 'vue2-ace-editor'

    export default {
        components: { editor },
        data() {
            return {
                pageForm: {
                    pageid: this.$route.params['pageid'] || '',
                    title: '',
                    pageurl: '',
                    tplcontent: ''
                },
                rules: {
                    title: [
                        { required: true, message: '请正确输入页面标题', trigger: 'blur' }
                    ],
                    pageurl: [
                        { required: true, message: '请正确输入页面链接', trigger: 'blur' }
                    ],
                    tplcontent: [
                        { required: true, message: '请正确输入模板内容', trigger: 'blur' }
                    ]
                }
            }
        },
        mounted() {
            if (this.pageForm.pageid) {
                this.$api.page.info(this.pageForm.pageid).then(data => {
                    this.pageForm = data
                }).catch(err => {
                    this.$error(err.errinfo)
                })
            }
        },
        methods: {
            editorInit() {
                require('vue2-ace-editor/node_modules/brace/mode/html')
                require('vue2-ace-editor/node_modules/brace/theme/github')
            },
            createPage(){
                if(this.pageForm.pageid){
                    this.$refs['pageForm'].validate((valid) => {
                        if (valid) {
                            this.$api.page.save(this.pageForm).then(data => {
                                this.$message({
                                    message: '保存成功',
                                    type: 'success'
                                });
                                this.$router.push('/page/page_list')
                            }).catch(err => {
                                this.$error(err.errinfo)
                            })
                        } else {
                            console.log(valid)
                        }
                    })
                }else{
                    this.$refs['pageForm'].validate((valid) => {
                        if (valid) {
                            this.$api.page.create(this.pageForm).then(data => {
                                this.$message({
                                    message: '添加成功',
                                    type: 'success'
                                });
                                this.$router.push('/page/page_list')
                            }).catch(err => {
                                this.$error(err.errinfo)
                            })
                        } else {
                            console.log(valid)
                        }
                    })
                }
            }
        }
    }
</script>

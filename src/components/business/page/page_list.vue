<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>通用页面管理</el-breadcrumb-item>
                <el-breadcrumb-item>页面列表</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-row :gutter="20">
            <el-col :span="12" v-for="page in page_list" :key="page.pageid">
                <el-card class="box-card" style="margin: 10px 0;">
                    <div slot="header" class="clearfix">
                        <span>{{page.title}}</span>
                        <el-button style="float: right;" size="mini"  @click="preview(page.pageurl)" icon="document" type="primary">查看</el-button>
                    </div>
                    <p style="padding-bottom: 20px">页面链接：{{page.pageurl}}</p>
                    <div>
                        <el-button size="mini"  @click="gotoBlockList(page.pageid)" icon="setting" type="primary">编辑</el-button>
                        <el-button size="mini"  @click="delPage(page)" icon="delete" type="danger">删除</el-button>
                        <el-button size="mini"  @click="editPage(page.pageid)" icon="edit" type="info">设置</el-button>
                        <el-button size="mini"  @click="publishPage(page)" icon="upload" type="warning">发布</el-button>

                    </div>
                </el-card>
            </el-col>
        </el-row>
        <el-pagination
            v-if="page_list.length > 0"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pagenum"
            :page-sizes="[20, 50, 100]"
            :page-size="pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
        </el-pagination>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                page_list: [],
                pagenum: 1,
                pagesize: 20,
            }
        },
        created() {
            this.getPageList()
        },
        methods:{
            getPageList(){
                this.$api.page.page_list(this.pagenum, this.pagesize).then(data => {
                    this.total = data.total
                    this.page_list = data.data
                    this.page_list.forEach( (page) => {
                        page.status = page.status === '1'
                    })
                }).catch(err => {
                    this.$error(err.errinfo)
                })
            },
            handleCurrentChange(page){
                this.pagenum = page
                this.getPageList()
            },
            handleSizeChange(size){
                this.pagesize = size
                this.getPageList()
            },
            delPage(target){
                this.$confirm(`是否删除页面 [ ${target.title} ]?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    closeOnClickModal:false,
                    closeOnPressEscape: false,
                    type: 'warning'
                }).then(() => {
                    this.$api.page.delete(target.pageid).then( data => {
                        this.$message({
                            type: 'success',
                            message: '删除成功!'
                        });
                        this.getPageList()
                    }).catch( err => {
                        this.$error(err.errinfo)
                    })

                }).catch(() => {

                });
            },
            editPage(pageid){
                this.$router.push('/page/page_form/'+pageid)
            },
            publishPage(target){
                this.$confirm(`是否发布页面 [ ${target.title} ]?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    closeOnClickModal:false,
                    closeOnPressEscape: false,
                    type: 'warning'
                }).then(() => {
                    this.$api.page.publish(target.pageid).then( data => {
                        this.$message({
                            type: 'success',
                            message: '发布成功!'
                        });
                        this.getPageList()
                    }).catch( err => {
                        this.$notify.error({
                            title: '错误',
                            message: err.errinfo
                        });
                    })

                }).catch(() => {

                });
            },
            gotoBlockList(pageid){
                this.$router.push('/page/page_list/block_list/'+pageid)
            },
            preview(pageurl){
                window.open('http://firefilm.wan2sha.com/' + pageurl, '_blank')
            }
        }
    }
</script>

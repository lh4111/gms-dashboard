<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>通用页面管理</el-breadcrumb-item>
                <el-breadcrumb-item to="/page/page_list">页面列表</el-breadcrumb-item>
                <el-breadcrumb-item :to="'/page/page_list/block_list/' + block_info.pageid">模块配置</el-breadcrumb-item>
                <el-breadcrumb-item>数据配置</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-tabs v-model="tabsName" @tab-click="changeTab">
            <el-tab-pane label="数据列表" name="list">
                <el-table :data="block_data_list" stripe style="width: 100%">
                    <el-table-column v-for="(field, index) in fields" :key="index" :prop="field.key" :label="field.label"></el-table-column>
                    <el-table-column label="操作" width="180" align="center">
                        <template slot-scope="scope">
                            <el-button type="info"
                                       size="mini"
                                       plain
                                       @click="editBlockData(scope.row)">修改

                            </el-button>
                            <el-button type="danger"
                                       size="mini"
                                       plain
                                       @click="delBlockData(scope.row)">删除

                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="数据添加" name="add">
                <form-builder ref="formBuilder" style="width:50%;" :options="block_info.form_config" :blockid="blockid" :dataid="dataid" @success="onSuccess"></form-builder>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
    import FormBuilder from '../../common/FormBuilder'

    export default {
        components: {
            FormBuilder
        },
        data() {
            return {
                block_data_list: [],
                tabsName: 'list',
                blockid: this.$route.params['blockid'],
                dataid: '',
                block_info: {
                    blockid: '',
                    blockkey: '',
                    form_config: [],
                    title: '',
                    pageid: '',
                },
                fields: [],
                origin_config: ''
            }
        },
        created() {
            this.getBlockList()
            this.getBlockInfo()
        },
        methods: {
            getBlockInfo(){
                this.$api.page.block_info(this.blockid).then(data => {
                    this.block_info = data
                    this.origin_config = data.form_config
                    this.block_info.form_config = JSON.parse(this.origin_config)

                    let _fields = []
                    this.block_info.form_config.forEach(field => {
                        _fields.push({
                            key: field.key,
                            label: field.label
                        })
                    })
                    this.fields = _fields
                })
            },
            getBlockList(){
                this.$api.page.block_data_list(this.blockid).then(data => {
                    let _list = []
                    data.data.forEach(el => {
                        let item = {
                            dataid: el.dataid,
                            blockid: el.blockid,
                        }
                        let el_data = JSON.parse(el.data)
                        Object.keys(el_data).forEach(field => {
                            item[field] = el_data[field]
                        })
                        _list.push(item)
                    })
                    this.block_data_list = _list
                }).catch(err => {
                    this.$error(err.errinfo)
                })
            },
            delBlockData(target){
                this.$confirm(`是否删除数据 [ ${target.title} ]?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    closeOnClickModal: false,
                    closeOnPressEscape: false,
                    type: 'warning'
                }).then(() => {
                    this.$api.page.block_data_delete(target.dataid).then(data => {
                        this.$message({
                            type: 'success',
                            message: '删除成功!'
                        });
                        this.getBlockList()
                    }).catch(err => {
                        this.$error(err.errinfo)
                    })
                }).catch(() => {

                });
            },
            editBlockData(block_data){
                this.form_data = block_data
                Object.keys(block_data).forEach(key => {
                    let index = this.block_info.form_config.findIndex(_field => {
                        return _field.key === key
                    })

                    if (index > -1) {
                        let item = this.block_info.form_config[index]
                        item.value = block_data[key]
                        this.$set(this.block_info.form_config,index,item)
                    }
                })
                this.$refs.formBuilder.options = this.block_info.form_config
                this.dataid = block_data.dataid
                this.tabsName = 'add'
            },
            changeTab(tab){
                this.tabsName = tab.name
                if (tab.name === 'list') {
                    this.getBlockList()
                    this.dataid = ''
                }else {
                    this.dataid = ''
                    this.block_info.form_config = JSON.parse(this.origin_config)
                }
            },
            onSuccess(){
                this.getBlockList()
                this.tabsName = 'list'
                this.dataid = ''
            }
        },
        watch: {
            block_info(value,oldValue){

            }
        }
    }
</script>
<style>
    h3 {
        margin: 10px 0 20px;
    }
</style>

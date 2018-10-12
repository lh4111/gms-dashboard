<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>通用页面管理</el-breadcrumb-item>
                <el-breadcrumb-item to="/page/page_list">页面列表</el-breadcrumb-item>
                <el-breadcrumb-item>模块配置</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <el-tabs v-model="tabsName" @tab-click="changeTab">
            <el-tab-pane label="模块列表" name="list">
                <el-row :gutter="20">
                    <el-col :span="12" v-for="block in block_list" :key="block.blockid">
                        <el-card class="box-card" style="margin: 10px 0;">
                            <div slot="header" class="clearfix">
                                <span>{{block.title}}</span>
                            </div>
                            <p style="padding-bottom:20px">{{block.blockkey}}</p>
                            <div>
                                <el-button size="mini"  @click="gotoBlockDataList(block.blockid)" icon="setting" type="primary">编辑</el-button>
                                <el-button size="mini"  @click="delBlock(block)" icon="delete" type="danger">删除</el-button>
                                <el-button size="mini"  @click="editBlock(block.blockid)" icon="edit" type="info">设置</el-button>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
                <el-pagination
                    v-if="block_list.length > 0"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="pagenum"
                    :page-sizes="[20, 50, 100]"
                    :page-size="pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
                </el-pagination>
            </el-tab-pane>
            <el-tab-pane label="添加模块" name="add">
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form :model="blockForm" :rules="rules" ref="blockForm" label-width="120px">
                            <el-form-item label="模块名称" prop="title">
                                <el-input v-model="blockForm.title"></el-input>
                            </el-form-item>
                            <el-form-item label="模块ID" prop="blockkey">
                                <el-input v-model="blockForm.blockkey"></el-input>
                            </el-form-item>
                            <el-form-item label="数据展示条数" prop="total">
                                <el-input type="number" v-model="blockForm.total"></el-input>
                                <!--<el-input-number v-model="blockForm.total" @change="" :min="1" :max="100"></el-input-number>-->
                            </el-form-item>
                            <el-form-item label="表单配置" prop="form_config">
                                <el-dropdown @command="appendField">
                                    <el-button size="mini"  type="primary">
                                        快速插入<i class="el-icon-caret-bottom el-icon--right"></i>
                                    </el-button>
                                    <el-dropdown-menu slot="dropdown">
                                        <el-dropdown-item command="text">单行文本框</el-dropdown-item>
                                        <el-dropdown-item command="textarea">多行文本框</el-dropdown-item>
                                        <el-dropdown-item command="number">数字文本框</el-dropdown-item>
                                        <el-dropdown-item command="radio">单项选择</el-dropdown-item>
                                        <el-dropdown-item command="checkbox">多项选择</el-dropdown-item>
                                        <el-dropdown-item command="select">单项下拉列表</el-dropdown-item>
                                        <el-dropdown-item command="selectMulti">多项下拉列表</el-dropdown-item>
                                        <el-dropdown-item command="upload">单文件上传</el-dropdown-item>
                                        <el-dropdown-item command="uploadMulti">多文件上传</el-dropdown-item>
                                        <el-dropdown-item command="date">日期选择</el-dropdown-item>
                                        <el-dropdown-item command="time">时间选择</el-dropdown-item>
                                        <el-dropdown-item command="datetime">日期时间选择</el-dropdown-item>
                                    </el-dropdown-menu>
                                </el-dropdown>
                                <el-button style="float: right" type="text" size="mini"  @click="formPreview">预览表单
                                </el-button>
                                <editor v-model="blockForm.form_config" @init="editorInit();" lang="json" theme="github"
                                        width="100%" height="550px"></editor>
                            </el-form-item>
                            <el-form-item>
                                <el-button type="primary" @click="createBlock()">
                                    {{ blockForm.blockid ? '保存' : '立即创建'}}
                                </el-button>
                                <el-button @click="$refs['blockForm'].resetFields()">重置</el-button>
                            </el-form-item>
                        </el-form>
                    </el-col>
                    <el-col :span="12">
                        <form-builder :options="preview_config" :preview="true"></form-builder>
                    </el-col>
                </el-row>
            </el-tab-pane>
        </el-tabs>

    </div>
</template>

<script>
    import editor from 'vue2-ace-editor'
    import FormBuilder from '../../common/FormBuilder'
    import beautify from 'json-beautify'
    export default {
        components: {
            editor,
            FormBuilder
        },
        data() {
            return {
                block_list: [],
                pagenum: 1,
                pagesize: 20,
                pageid: this.$route.params['pageid'],
                tabsName: 'list',
                blockForm: {
                    blockid: '',
                    pageid: this.$route.params['pageid'],
                    blockkey: '',
                    title: '',
                    total: 0,
                    form_config: ''
                },
                preview_config: [],
                rules: {
                    title: [
                        { required: true, message: '请正确输入页面标题', trigger: 'blur' }
                    ],
                    blockkey: [
                        { required: true, message: '请正确输入模块ID', trigger: 'blur' }
                    ],
                    form_config: [
                        { required: true, message: '请正确输入模板内容', trigger: 'blur' }
                    ],
                    total: [
                        { required: true, message: '请正确输入数据展示条数', trigger: 'blur' }
                    ]
                },
                dialogFormVisible: false,
                dialogRulesVisible: false,
                codeSnippets: {
                    text: {
                        "key": "title",
                        "label": "标题",
                        "type": "text",
                        "value": "",
                        "rule": {
                            "required": true,
                            "min": 2,
                            "max": 50,
                            "message": "请正确输入电影标题",
                            "trigger": "blur"
                        }
                    },
                    textarea: {
                        "key": "content",
                        "label": "描述",
                        "type": "textarea",
                        "value": "",
                        "rule": {
                            "required": true,
                            "minlength": 10,
                            "maxlength": 1000,
                            "message": "请正确输入电影标题",
                            "trigger": "blur"
                        }
                    },
                    number: {
                        "key": "duration",
                        "label": "数量",
                        "type": "text-number",
                        "value": "0",
                        "rule": {
                            "type": "number",
                            "required": true,
                            "message": "请正确输入电影时长",
                            "trigger": "blur"
                        }
                    },
                    radio: {
                        "key": "sex",
                        "label": "性别",
                        "type": "radio",
                        "value": "1",
                        "option": [
                            { "value": "1", "name": "男" }, { "value": "2", "name": "女" }
                        ],
                        "rule": { "required": true, "message": "请正确输入电影标题", "trigger": "blur" }
                    },
                    checkbox: {
                        "key": "interest",
                        "label": "兴趣",
                        "type": "checkbox",
                        "value": ["1", "2"],
                        "option": [
                            { "value": "1", "name": "音乐" },
                            { "value": "2", "name": "电影" },
                            { "value": "3", "name": "小说" },
                            { "value": "4", "name": "天文" },
                            { "value": "5", "name": "旅行" },
                            { "value": "6", "name": "读书" },
                        ],
                        "rule": { "type": "array", "required": true, "message": "请正确输入电影标题", "trigger": "blur" }
                    },
                    select: {
                        "key": "education",
                        "label": "学历",
                        "type": "select",
                        "value": "1",
                        "option": [
                            { "value": "1", "name": "高中" },
                            { "value": "2", "name": "本科" },
                            { "value": "3", "name": "硕士" },
                            { "value": "4", "name": "博士" }
                        ],
                        "rule": { "required": true, "message": "请正确输入电影标题", "trigger": "blur" }
                    },
                    selectMulti: {
                        "key": "job",
                        "label": "职业",
                        "type": "select-multi",
                        "value": ["1", "3"],
                        "option": [
                            { "value": "1", "name": "程序猿" },
                            { "value": "2", "name": "设计狮" },
                            { "value": "3", "name": "产品狗" },
                            { "value": "4", "name": "运营狗" }
                        ],
                        "rule": { "type": "array", "required": true, "message": "请正确输入电影标题", "trigger": "blur" }
                    },
                    upload: {
                        "key": "image",
                        "label": "图片",
                        "type": "upload",
                        "value": "",
                        "width": 200,
                        "height": 200,
                        "tips": "建议尺寸200×200",
                        "rule": { "required": true, "message": "请上传图片", "trigger": "blur" }
                    },
                    uploadMulti: {
                        "key": "cover",
                        "label": "头像",
                        "type": "upload-multi",
                        "value": "",
                        "tips": "建议尺寸200×200",
                        "rule": { "required": true, "message": "请正确输入电影标题", "trigger": "blur" }
                    },
                    date: {
                        "key": "ymd",
                        "label": "日期",
                        "type": "date",
                        "value": "",
                        "rule": { "type": "date", "required": true, "message": "请正确输入电影标题", "trigger": "blur" }
                    },
                    time: {
                        "key": "time",
                        "label": "时间",
                        "type": "time",
                        "value": "",
                        "rule": { "required": true, "message": "请正确输入电影标题", "trigger": "blur" }
                    },
                    datetime: {
                        "key": "ymdhms",
                        "label": "开始时间",
                        "type": "datetime",
                        "value": "",
                        "rule": { "type": "date", "required": true, "message": "请正确输入电影标题", "trigger": "blur" }
                    }
                }
            }
        },
        created() {
            this.getBlockList()
        },
        methods: {
            gotoBlockDataList(blockid){
                this.$router.push('/page/page_list/block_list/block_data/' + blockid)
            },
            editorInit() {
                require('vue2-ace-editor/node_modules/brace/mode/json')
                require('vue2-ace-editor/node_modules/brace/ext/beautify')
                require('vue2-ace-editor/node_modules/brace/ext/keybinding_menu')
                require('vue2-ace-editor/node_modules/brace/theme/github')
            },
            getBlockList(){
                this.$api.page.block_list(this.pageid).then(data => {
                    this.total = data.total
                    this.block_list = data
                }).catch(err => {
                    this.$error(err.errinfo)
                })
            },
            handleCurrentChange(page){
                this.pagenum = page
                this.getBlockList()
            },
            handleSizeChange(size){
                this.pagesize = size
                this.getBlockList()
            },
            createBlock(){
                if (this.blockForm.blockid) {
                    this.$refs['blockForm'].validate((valid) => {
                        if (valid) {
                            this.$api.page.block_save(this.blockForm).then(data => {
                                this.$message({
                                    message: '保存成功',
                                    type: 'success'
                                });
                                this.tabsName = 'list'
                                this.getBlockList()
                            }).catch(err => {
                                this.$error(err.errinfo)
                            })
                        } else {
                            console.log(valid)
                        }
                    })
                } else {
                    this.$refs['blockForm'].validate((valid) => {
                        if (valid) {
                            this.$api.page.block_create(this.blockForm).then(data => {
                                this.$message({
                                    message: '添加成功',
                                    type: 'success'
                                });
                                this.tabsName = 'list'
                                this.getBlockList()
                            }).catch(err => {
                                this.$error(err.errinfo)
                            })
                        } else {
                            console.log(valid)
                        }
                    })
                }
            },
            delBlock(target){
                this.$confirm(`是否删除模块 [ ${target.title} ]?`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    closeOnClickModal: false,
                    closeOnPressEscape: false,
                    type: 'warning'
                }).then(() => {
                    this.$api.page.block_delete(target.blockid).then(data => {
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
            editBlock(blockid){
                this.$api.page.block_info(blockid).then(data => {
                    this.blockForm = data
                    this.tabsName = 'add'
                }).catch(err => {
                    this.$error(err.errinfo)
                })
            },
            changeTab(tab){
                this.tabsName = tab.name
                if (tab.name === 'list') {
                    this.getBlockList()
                    this.$refs['blockForm'].resetFields()
                }
            },
            formPreview(){
                try {
                    this.preview_config = JSON.parse(this.blockForm.form_config || '[]')
//                    this.dialogFormVisible = true
                } catch (err) {
                    this.$alert('请检查JSON代码格式是否正确！', 'JSON解析错误', {
                        confirmButtonText: '确定'
                    });
                }
            },
            appendField(type){
                let _temp = JSON.parse(this.blockForm.form_config || '[]')
                _temp.push(this.codeSnippets[type])
                console.log(_temp)
                this.blockForm.form_config = beautify(_temp, null, 4, 100)
                this.preview_config = JSON.parse(this.blockForm.form_config || '[]')
            }
        }
    }
</script>

<template>
    <div>
        <el-row>
            <el-col :span="12">
                <el-form :model="branchForm" :rules="rules" ref="branchForm" label-width="100px">
                    <el-form-item label="部门名称" prop="name">
                        <el-input v-model="branchForm.name"></el-input>
                    </el-form-item>
                    <el-form-item label="上级部门">
                        <el-select v-model="branchForm.upbranchid" placeholder="请选择上级部门">
                            <el-option label="默认部门" value="0"></el-option>
                            <el-option :label="branch.name" v-for="branch in branch_list" :key="branch.branchid" :value="branch.branchid"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="部门区域">
                        <el-cascader
                            :options="areaOptions"
                            :props="areaOptionProps"
                            v-model="selectedAreaOptions"
                            @change="handleAreaChange"
                            @active-item-change="areaActiveItemChange"
                            filterable>
                        </el-cascader>
                    </el-form-item>
                    <el-form-item label="部门地址" prop="address">
                        <el-input v-model="branchForm.address"></el-input>
                    </el-form-item>
                    <el-form-item label="备注">
                        <el-input type="textarea" v-model="branchForm.remark"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="createBranch()">立即创建</el-button>
                        <el-button>取消</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import areaData from '@/assets/data/area.json'
    export default {
        data() {
            return {
                branchForm: {
                    branchid: '',
                    name: '',
                    upbranchid: '0',
                    remark: '',
                    area: '0',
                    province: '0',
                    city: '0',
                    town:'0',
                    address:'',
                    coordinate: '0',
                    status: 0
                },
                rules: {
                    name: [
                        { required: true, message: '请输入部门名称', trigger: 'blur' }
                    ],
                    address: [
                        { required: true, message: '请输入部门地址', trigger: 'blur' }
                    ]
                },
                branch_list: [],
                areaOptions: areaData,
                selectedAreaOptions: ["430000", "430100", "430104"],
                areaOptionProps:{
                    value: 'code',
                    label: 'name',
                    children: 'items'
                }
            }
        },
        created() {
            this.getAllBranch()
        },
        methods: {
            createBranch(){
                this.$refs['branchForm'].validate((valid) => {
                    if (valid) {
                        this.$api.branch.create(this.branchForm).then( data => {
                            this.$message({
                                message: '添加成功',
                                type: 'success'
                            });
                            this.$router.push('/branch/branch_list')
                        }).catch( err => {
                            this.$error(err.errinfo)
                        })
                    }else{
                        console.log(valid)
                    }
                })
            },
            getAllBranch() {
                this.$api.branch.page_list(1, 1000).then(data => {
                    // this.total = data.total
                    this.branch_list = data.data
                }).catch(err => {
                    this.$error(err.errinfo)
                })
            },
            handleAreaChange(data){
//                console.log(data)
                let province = data[0],
                        city = data[1],
                        area = data[2],
                        town = data[3]
                this.branchForm.province = province
                this.branchForm.city = city
                this.branchForm.area = area
                this.branchForm.town = town

            },
            areaActiveItemChange(data){
                console.log(data)
            }
        }
    }
</script>
<style>
    .el-cascader{
        width: 100%
    }
</style>

<template>
    <div>
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-form-item v-for="(field, index) in options" :key="index" :label="field.label" :prop="field.key">
                <el-input v-if="field.type === 'text'" v-model="form[field.key]" :value="field.value"></el-input>
                <el-input-number v-if="field.type === 'text-number'" v-model="form[field.key]"
                                 :value="field.value"></el-input-number> <!-- :min="1" :max="10" -->
                <el-input v-if="field.type === 'textarea'"
                          type="textarea"
                          :autosize="{ minRows: 2, maxRows: 5}"
                          placeholder="请输入内容"
                          v-model="form[field.key]"
                          :value="field.value">
                </el-input>
                <el-radio-group v-if="field.type === 'radio'" v-model="form[field.key]">
                    <el-radio v-for="(option, index) in field.option" :key="index" :label="option.value">
                        {{option.name}}
                    </el-radio>
                </el-radio-group>
                <el-radio-group v-if="field.type === 'checkbox'" v-model="form[field.key]">
                    <el-checkbox v-for="(option, index) in field.option" :key="index" :label="option.value">
                        {{option.name}}
                    </el-checkbox>
                </el-radio-group>
                <el-select v-if="field.type === 'select'" v-model="form[field.key]">
                    <el-option v-for="(option, index) in field.option" :key="index" :label="option.name"
                               :value="option.value"></el-option>
                </el-select>
                <el-select v-if="field.type === 'select-multi'" multiple v-model="form[field.key]">
                    <el-option v-for="(option, index) in field.option" :key="index" :label="option.name"
                               :value="option.value"></el-option>
                </el-select>
                <el-date-picker v-if="field.type === 'date'" type="date" placeholder="选择日期"
                                v-model="form[field.key]"></el-date-picker>
                <el-time-picker v-if="field.type === 'time'" placeholder="选择日期"
                                v-model="form[field.key]"></el-time-picker>
                <el-date-picker v-if="field.type === 'datetime'" type="datetime" placeholder="选择日期"
                                v-model="form[field.key]"></el-date-picker>
                <image-crop-upload
                    v-if="field.type === 'upload'"
                    :field="field.key"
                    v-model="form[field.key]"
                    :width="field.width"
                    :height="field.height"
                    @crop-upload-success="handleUploadSuccess"
                    :url="getUploadUrl('temp')"></image-crop-upload>
                <template v-if="field.type === 'upload-multi'">
                    <el-upload
                        :action="getUploadUrl('temp')"
                        list-type="picture-card"
                        :on-success="handleUploadMultiSuccess"
                        :on-preview="handlePictureCardPreview"
                        :on-remove="handleRemove">
                        <i class="el-icon-plus"></i>
                    </el-upload>
                    <el-dialog :visible.sync="dialogVisible" size="tiny">
                        <img width="100%" :src="dialogImageUrl" alt="">
                    </el-dialog>
                </template>
            </el-form-item>
            <el-form-item v-if="!preview">
                <el-button type="primary" @click="onSubmit">{{dataid ? '保存' : '立即创建'}}</el-button>
                <el-button @click="$refs.form.resetFields();">重置</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>
<script>
    import { getUploadUrl } from '../../util'
    import ImageCropUpload from './ImageCropUpload';
    export default {
        components: { ImageCropUpload },
        props: {
            options: {
                type: Array,
                required: true,
                default: []
            },
            blockid: {
                type: String,
                default: ''
            },
            dataid: {
                type: String,
                default: ''
            },
            preview: {
                type: Boolean,
                default: false
            }
        },
        data(){
            let form = {}
            let rules = {}

            this.options.forEach(field => {
                form[field.key] = field.value
                rules[field.key] = [field.rule]
            })

            return {
                getUploadUrl,
                form,
                rules,
                dialogImageUrl: '',
                dialogVisible: false
            }
        },
        watch: {
            options(value, oldValue){
                value.forEach(field => {
                    this.$set(this.form, field.key, field.value)
                    this.$set(this.rules, field.key, field.rule)
                })
            }
        },
        methods: {
            onSubmit(){
                if (this.dataid) {
                    this.$refs['form'].validate((valid) => {
                        if (valid) {
                            this.$api.page.block_data_save(this.dataid, JSON.stringify(this.form)).then(data => {
                                this.$message({
                                    message: '修改成功',
                                    type: 'success'
                                });
                                this.$emit('success')
                                this.$refs.form.resetFields()
                            }).catch(err => {
                                this.$error(err.errinfo)
                            })
                        } else {
                            console.log(valid)
                        }
                    })
                } else {
                    this.$refs['form'].validate((valid) => {
                        if (valid) {
                            this.$api.page.block_data_add(this.blockid, JSON.stringify(this.form)).then(data => {
                                this.$message({
                                    message: '添加成功',
                                    type: 'success'
                                });
                                this.$emit('success')
                                this.$refs.form.resetFields()
                            }).catch(err => {
                                this.$error(err.errinfo)
                            })
                        }
                    })
                }
            },
            handleUploadSuccess(res, file, fileList){
                if (res.errcode === 0) {
                    this.$set(this.form, res.data.fieldname, res.data.filepath)
                }
            },
            handleUploadMultiSuccess(res, file, fileList){
                if (res.errcode === 0) {
                    console.log(res)
//                    this.$set(this.form, res.data.fieldname, res.data.filepath)
                }
            },
            handleUploadError(){
                this.$notify.error({
                    title: '上传失败',
                    message: '图片上传失败'
                });
            },
            handleRemove(file, fileList) {
                console.log(file, fileList);
            },
            handlePictureCardPreview(file) {
                this.dialogImageUrl = file.url;
                this.dialogVisible = true;
            }
        }
    }
</script>
<style>
    .avatar-uploader {
        float: left;
        margin-right: 10px
    }

    .avatar-uploader .el-upload {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        width: 270px;
        height: 170px;
    }

    .avatar-uploader .el-upload:hover {
        border-color: #20a0ff;
    }

    .avatar-uploader-icon i {
        font-size: 28px;
        display: block;
        margin: 60px 0 30px;
    }

    .avatar-uploader-icon {
        font-size: 14px;
        color: #8c939d;
        text-align: center;
    }

    .avatar {
        width: 100%;
        height: 170px;
        object-fit: cover;
        display: block;
    }
</style>

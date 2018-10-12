<template>
    <div class="image-crop-upload" v-loading.body="loading">
        <div class="upload-block" v-if="step == 1 && !value" @dragleave="preventDefault" @dragover="preventDefault"
             @dragenter="preventDefault" @click="handleClick" @drop="handleChange">
            <p class="upload-tip"><i class="el-icon-plus"></i>{{tip}} <br> 图片尺寸{{width}}×{{height}}</p>
        </div>
        <img class="upload-image" @click="handleClick" @drop="handleChange" v-if="step !== 2 && value" :src="value | fileurl" alt="">
        <div v-if="step == 2" style="margin:10px">
            <div style="float: left;width:240px; height:220px; margin-right:20px">
                <div class="img-oper-container">
                    <img :src="sourceImgUrl" :style="sourceImgStyle" class="vicp-img" draggable="false"
                         @drag="preventDefault"
                         @dragstart="preventDefault"
                         @dragend="preventDefault"
                         @dragleave="preventDefault"
                         @dragover="preventDefault"
                         @dragenter="preventDefault"
                         @drop="preventDefault"
                         @touchstart="imgStartMove"
                         @touchmove="imgMove"
                         @touchend="createImg"
                         @touchcancel="createImg"
                         @mousedown="imgStartMove"
                         @mousemove="imgMove"
                         @mouseup="createImg"
                         @mouseout="createImg"
                         ref="img">
                    <div class="vicp-img-shade vicp-img-shade-1" :style="sourceImgShadeStyle"></div>
                    <div class="vicp-img-shade vicp-img-shade-2" :style="sourceImgShadeStyle"></div>
                </div>
                <el-slider v-model="scale.range" :min="0" :max="100" @change="zoomChange"></el-slider>
            </div>
            <div style="float: left">
                <div class="img-preview-container">
                    <img :src="createImgUrl" :style="previewStyle">
                </div>
                <el-button size="mini"  @click="upload">上传</el-button>
                <el-button size="mini"  @click="setStep(1)">取消</el-button>
            </div>
        </div>
        <div v-show="false">
            <input type="file" @change="handleChange" ref="fileinput">
            <canvas :width="width" :height="height" ref="canvas"></canvas>
        </div>
    </div>

</template>

<script>
    'use strict';

    const mimes = {
            'jpg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'svg': 'image/svg+xml',
            'psd': 'image/photoshop'
        },
        // database64文件格式转换为2进制
        data2blob = function (data, mime) {
            // dataURL 的格式为 “data:image/png;base64,****”,逗号之前都是一些说明性的文字，我们只需要逗号之后的就行了
            data = data.split(',')[1];
            data = window.atob(data);
            var ia = new Uint8Array(data.length);
            for (var i = 0; i < data.length; i++) {
                ia[i] = data.charCodeAt(i);
            }
            ;
            // canvas.toDataURL 返回的默认格式就是 image/png
            return new Blob([ia], {
                type: mime
            });
        };

    export default {
        props: {
            // 域，上传文件name，触发事件会带上（如果一个页面多个图片上传控件，可以做区分
            field: {
                type: String,
                'default': 'image'
            },
            // 原名key，类似于id，触发事件会带上（如果一个页面多个图片上传控件，可以做区分
            ki: {
                'default': 0
            },
            // 绑定上传成功的图片路径
            value: {
                type: String,
                'default': ''
            },
            tip: {
                type: String,
                'default': ''
            },
            // 上传地址
            url: {
                type: String,
                'default': ''
            },
            // 其他要上传文件附带的数据，对象格式
            params: {
                type: Object,
                'default': null
            },
            //Add custom headers
            headers: {
                type: Object,
                'default': null
            },
            // 剪裁图片的宽
            width: {
                type: Number,
                default: 200
            },
            // 剪裁图片的高
            height: {
                type: Number,
                default: 200
            },
            // 单文件大小限制
            maxSize: {
                type: Number,
                'default': 10240
            },
            // 语言类型
            langType: {
                type: String,
                'default': 'zh'
            },
            // 语言包
            langExt: {
                type: Object,
                'default': null
            },
            // 图片上传格式
            imgFormat: {
                type: String,
                'default': 'jpg'
            }
        },
        data() {
            let that = this,
                {
                    imgFormat,
                    langType,
                    langExt,
                    width,
                    height
                } = that,
                isSupported = true,
                allowImgFormat = [
                    'jpg',
                    'png'
                ],
                langBag = {
                    zh: {
                        hint: '点击，或拖动图片至此处',
                        loading: '正在上传……',
                        noSupported: '浏览器不支持该功能，请使用IE10以上或其他现在浏览器！',
                        success: '上传成功',
                        fail: '图片上传失败',
                        preview: '头像预览',
                        btn: {
                            off: '取消',
                            close: '关闭',
                            back: '上一步',
                            save: '保存'
                        },
                        error: {
                            onlyImg: '仅限图片格式',
                            outOfSize: '单文件大小不能超过 ',
                            lowestPx: '图片最低像素为（宽*高）：'
                        }
                    },
                    en: {
                        hint: 'Click, or drag the file here',
                        loading: 'Uploading……',
                        noSupported: 'Browser does not support, please use IE10+ or other browsers',
                        success: 'Upload success',
                        fail: 'Upload failed',
                        preview: 'Preview',
                        btn: {
                            off: 'Cancel',
                            close: 'Close',
                            back: 'Back',
                            save: 'Save'
                        },
                        error: {
                            onlyImg: 'Image only',
                            outOfSize: 'Image exceeds size limit: ',
                            lowestPx: 'The lowest pixel in the image: '
                        }
                    },
                    ru: {
                        hint: 'Нажмите, или перетащите файл в это окно',
                        loading: 'Загружаю……',
                        noSupported: 'Ваш браузер не поддерживается, пожалуйста, используйте IE10 + или другие браузеры',
                        success: 'Загрузка выполнена успешно',
                        fail: 'Ошибка загрузки',
                        preview: 'Предпросмотр',
                        btn: {
                            off: 'Отменить',
                            close: 'Закрыть',
                            back: 'Назад',
                            save: 'Сохранить'
                        },
                        error: {
                            onlyImg: 'Только изображения',
                            outOfSize: 'Изображение превышает предельный размер: ',
                            lowestPx: 'Минимальный размер изображения: '
                        }
                    }
                },
                tempImgFormat = allowImgFormat.indexOf(imgFormat) === -1 ? 'jpg' : imgFormat,
                lang = langBag[langType] ? langBag[langType] : lang['zh'],
                mime = mimes[tempImgFormat];
            // 规范图片格式
            that.imgFormat = tempImgFormat;

            if (langExt) {
                Object.assign(lang, langExt);
            }
            if (typeof FormData != 'function') {
                isSupported = false;
            }
            return {
                // 图片的mime
                mime,

                // 语言包
                lang,

                // 浏览器是否支持该控件
                isSupported,
                // 浏览器是否支持触屏事件
                isSupportTouch: document.hasOwnProperty("ontouchstart"),

                // 步骤
                step: 1, //1选择文件 2剪裁 3上传

                // 上传状态及进度
                loading: false, //true 上传中
                progress: 0,
                // 需求图宽高比
                // ratio: width / height,

                // 原图地址、生成图片地址
                sourceImg: null,
                sourceImgUrl: '',
                createImgUrl: '',

                visible: false,

                // 原图片拖动事件初始值
                sourceImgMouseDown: {
                    on: false,
                    mX: 0, //鼠标按下的坐标
                    mY: 0,
                    x: 0, //scale原图坐标
                    y: 0
                },

                // 生成图片预览的容器大小
                previewContainer: {
                    width: 200,
                    height: 200
                },

                // 原图容器宽高
                sourceImgContainer: { // sic
                    width: 250,
                    height: 200
                },

                // 原图展示属性
                scale: {
                    zoomAddOn: false, //按钮缩放事件开启
                    zoomSubOn: false, //按钮缩放事件开启
                    range: 1, //最大100
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                    maxWidth: 0,
                    maxHeight: 0,
                    minWidth: 0, //最宽
                    minHeight: 0,
                    naturalWidth: 0, //原宽
                    naturalHeight: 0
                }
            }
        },
        computed: {
            ratio(){
                return this.width / this.height
            },
            // 进度条样式
            progressStyle() {
                let {
                    progress
                } = this;
                return {
                    width: progress + '%'
                }
            },
            // 原图样式
            sourceImgStyle() {
                let {
                        scale,
                        sourceImgMasking
                    } = this,
                    top = scale.y + sourceImgMasking.y + 'px',
                    left = scale.x + sourceImgMasking.x + 'px';
                return {
                    top,
                    left,
                    width: scale.width + 'px',
                    height: scale.height + 'px'
                }
            },
            // 原图蒙版属性
            sourceImgMasking() {
                let {
                        width,
                        height,
                        ratio,
                        sourceImgContainer
                    } = this,
                    sic = sourceImgContainer,
                    sicRatio = sic.width / sic.height, // 原图容器宽高比
                    x = 0,
                    y = 0,
                    w = sic.width,
                    h = sic.height,
                    scale = 1;
                if (ratio < sicRatio) {
                    scale = sic.height / height;
                    w = sic.height * ratio;
                    x = (sic.width - w) / 2;
                }
                if (ratio > sicRatio) {
                    scale = sic.width / width;
                    h = sic.width / ratio;
                    y = (sic.height - h) / 2;
                }
                return {
                    scale, // 蒙版相对需求宽高的缩放
                    x,
                    y,
                    width: w,
                    height: h
                };
            },
            // 原图遮罩样式
            sourceImgShadeStyle() {
                let {
                        sourceImgMasking,
                        sourceImgContainer
                    } = this,
                    sic = sourceImgContainer,
                    sim = sourceImgMasking,
                    w = sim.width == sic.width ? sim.width : (sic.width - sim.width) / 2,
                    h = sim.height == sic.height ? sim.height : (sic.height - sim.height) / 2;
                return {
                    width: w + 'px',
                    height: h + 'px'
                };
            },
            previewStyle() {
                let {
                        width,
                        height,
                        ratio,
                        previewContainer
                    } = this,
                    pc = previewContainer,
                    w = pc.width,
                    h = pc.height,
                    pcRatio = w / h;
                if (ratio < pcRatio) {
                    w = pc.height * ratio;
                }
                if (ratio > pcRatio) {
                    h = pc.width / ratio;
                }
                return {
                    width: w + 'px',
                    height: h + 'px'
                };
            }
        },
        methods: {
            // 关闭控件
            off() {
                let that = this;
                setTimeout(function () {
                    //that.$emit('input', false);
//                    that.visible = false
                    if (that.step == 3 && that.loading == 2) {
                        that.setStep(1);
                    }
                }, 200);
            },
            // 设置步骤
            setStep(no) {
                let that = this;
                setTimeout(function () {
                    that.step = no;
                }, 200);
            },

            /* 图片选择区域函数绑定
             ---------------------------------------------------------------*/
            preventDefault(e) {
                e.preventDefault();
                return false;
            },
            handleClick(e) {
                if (this.loading !== 1) {
                    if (e.target !== this.$refs.fileinput) {
                        e.preventDefault();
                        if (document.activeElement !== this.$refs) {
                            this.$refs.fileinput.click();
                        }
                    }
                }
            },
            handleChange(e) {
                e.preventDefault();
                if (this.loading !== 1) {
                    let files = e.target.files || e.dataTransfer.files;

                    if (this.checkFile(files[0])) {
                        this.setSourceImg(files[0]);
                    }
                }
            },
            /* ---------------------------------------------------------------*/

            // 检测选择的文件是否合适
            checkFile(file) {
                let that = this,
                    {
                        lang,
                        maxSize
                    } = that;
                // 仅限图片
                if (file.type.indexOf('image') === -1) {
                    that.$message({
                        type: 'error',
                        message: lang.error.onlyImg
                    })
                    return false;
                }

                // 超出大小
                if (file.size / 1024 > maxSize) {
                    that.$message({
                        type: 'error',
                        showClose: true,
                        message: lang.error.outOfSize + maxSize + 'kb'
                    })
                    return false;
                }
                return true;
            },
            // 设置图片源
            setSourceImg(file) {
                let that = this,
                    fr = new FileReader();
                fr.onload = function (e) {
                    that.sourceImgUrl = fr.result;
                    that.startCrop();
                }
                fr.readAsDataURL(file);
            },
            // 剪裁前准备工作
            startCrop() {
                let that = this,
                    {
                        width,
                        height,
                        ratio,
                        scale,
                        sourceImgUrl,
                        sourceImgMasking,
                        lang
                    } = that,
                    sim = sourceImgMasking,
                    img = new Image();
                img.src = sourceImgUrl;
                img.onload = function () {
                    let nWidth = img.naturalWidth,
                        nHeight = img.naturalHeight,
                        nRatio = nWidth / nHeight,
                        w = sim.width,
                        h = sim.height,
                        x = 0,
                        y = 0;
                    // 图片像素不达标
                    if (nWidth < width || nHeight < height) {
                        that.$message({
                            type: 'error',
                            showClose: true,
                            message: lang.error.lowestPx + width + '*' + height
                        })
                        return false;
                    }
                    if (ratio > nRatio) {
                        h = w / nRatio;
                        y = (sim.height - h) / 2;
                    }
                    if (ratio < nRatio) {
                        w = h * nRatio;
                        x = (sim.width - w) / 2;
                    }
                    scale.range = 0;
                    scale.x = x;
                    scale.y = y;
                    scale.width = w;
                    scale.height = h;
                    scale.minWidth = w;
                    scale.minHeight = h;
                    scale.maxWidth = nWidth * sim.scale;
                    scale.maxHeight = nHeight * sim.scale;
                    scale.naturalWidth = nWidth;
                    scale.naturalHeight = nHeight;
                    that.sourceImg = img;
                    that.createImg();
                    that.setStep(2);
                };
            },
            // 鼠标按下图片准备移动
            imgStartMove(e) {
                e.preventDefault();
                // 支持触摸事件，则鼠标事件无效
                if (this.isSupportTouch && !e.targetTouches) {
                    return false;
                }
                let et = e.targetTouches ? e.targetTouches[0] : e,
                    {
                        sourceImgMouseDown,
                        scale
                    } = this,
                    simd = sourceImgMouseDown;
                simd.mX = et.screenX;
                simd.mY = et.screenY;
                simd.x = scale.x;
                simd.y = scale.y;
                simd.on = true;
            },
            // 鼠标按下状态下移动，图片移动
            imgMove(e) {
                e.preventDefault();
                // 支持触摸事件，则鼠标事件无效
                if (this.isSupportTouch && !e.targetTouches) {
                    return false;
                }
                let et = e.targetTouches ? e.targetTouches[0] : e,
                    {
                        sourceImgMouseDown: {
                            on,
                            mX,
                            mY,
                            x,
                            y
                        },
                        scale,
                        sourceImgMasking
                    } = this,
                    sim = sourceImgMasking,
                    nX = et.screenX,
                    nY = et.screenY,
                    dX = nX - mX,
                    dY = nY - mY,
                    rX = x + dX,
                    rY = y + dY;
                if (!on) return;
                if (rX > 0) {
                    rX = 0;
                }
                if (rY > 0) {
                    rY = 0;
                }
                if (rX < sim.width - scale.width) {
                    rX = sim.width - scale.width;
                }
                if (rY < sim.height - scale.height) {
                    rY = sim.height - scale.height;
                }
                scale.x = rX;
                scale.y = rY;
            },
            zoomChange(e) {
                this.zoomImg(e);
            },
            // 缩放原图
            zoomImg(newRange) {
                let that = this,
                    {
                        sourceImgMasking,
                        sourceImgMouseDown,
                        scale
                    } = this,
                    {
                        maxWidth,
                        maxHeight,
                        minWidth,
                        minHeight,
                        width,
                        height,
                        x,
                        y,
                        range
                    } = scale,
                    sim = sourceImgMasking,
                    // 蒙版宽高
                    sWidth = sim.width,
                    sHeight = sim.height,
                    // 新宽高
                    nWidth = minWidth + (maxWidth - minWidth) * newRange / 100,
                    nHeight = minHeight + (maxHeight - minHeight) * newRange / 100,
                    // 新坐标（根据蒙版中心点缩放）
                    nX = sWidth / 2 - (nWidth / width) * (sWidth / 2 - x),
                    nY = sHeight / 2 - (nHeight / height) * (sHeight / 2 - y);

                // 判断新坐标是否超过蒙版限制
                if (nX > 0) {
                    nX = 0;
                }
                if (nY > 0) {
                    nY = 0;
                }
                if (nX < sWidth - nWidth) {
                    nX = sWidth - nWidth;
                }
                if (nY < sHeight - nHeight) {
                    nY = sHeight - nHeight;
                }

                // 赋值处理
                scale.x = nX;
                scale.y = nY;
                scale.width = nWidth;
                scale.height = nHeight;
                scale.range = newRange;
                setTimeout(function () {
                    if (scale.range == newRange) {
                        that.createImg();
                    }
                }, 300);
            },
            // 生成需求图片
            createImg(e) {
                let that = this,
                    {
                        mime,
                        sourceImg,
                        scale: {
                            x,
                            y,
                            width,
                            height
                        },
                        sourceImgMasking: {
                            scale
                        }
                    } = that,
                    canvas = that.$refs.canvas,
                    ctx = canvas.getContext('2d');
                if (e) {
                    // 取消鼠标按下移动状态
                    that.sourceImgMouseDown.on = false;
                }
                ctx.clearRect(0, 0, that.width, that.height);
                ctx.drawImage(sourceImg, x / scale, y / scale, width / scale, height / scale);
                that.createImgUrl = canvas.toDataURL(mime);
            },
            // 上传图片
            upload() {
                let that = this,
                    {
                        lang,
                        imgFormat,
                        mime,
                        url,
                        params,
                        headers,
                        field,
                        ki,
                        createImgUrl
                    } = this,
                    fmData = new FormData();
                fmData.append(field, data2blob(createImgUrl, mime), field + '.' + imgFormat);

                // 添加其他参数
                if (typeof params == 'object' && params) {
                    Object.keys(params).forEach((k) => {
                        fmData.append(k, params[k]);
                    })
                }

                // 监听进度回调
                const uploadProgress = function (event) {
                    if (event.lengthComputable) {
                        that.progress = 100 * Math.round(event.loaded) / event.total;
                    }
                };

                // 上传文件

                that.loading = true;

                that.$emit('crop-success', createImgUrl, field, ki);
                new Promise(function (resolve, reject) {
                    let client = new XMLHttpRequest();
                    client.open('POST', url, true);
                    client.onreadystatechange = function () {
                        if (this.readyState !== 4) {
                            return;
                        }
                        if (this.status === 200 || this.status === 201) {
                            resolve(JSON.parse(this.responseText));
                        } else {
                            reject(this.status);
                        }
                    };
                    client.upload.addEventListener("progress", uploadProgress, false); //监听进度
                    // 设置header
                    if (typeof headers == 'object' && headers) {
                        Object.keys(headers).forEach((k) => {
                            client.setRequestHeader(k, headers[k]);
                        })
                    }
                    client.send(fmData);
                }).then(
                    // 上传成功
                    function (resData) {
                        that.loading = false;
                        that.setStep(3);
                        that.progress = 0
                        that.$emit('input', resData.data.filepath);
                        that.$emit('crop-upload-success', resData, field, ki);
                    },
                    // 上传失败
                    function (sts) {
                        that.loading = false;
                        that.progress = 0
                        that.$message({
                            type: 'error',
                            showClose: true,
                            message: lang.fail
                        })
                        that.$emit('crop-upload-fail', sts, field, ki);
                    }
                );
            }
        }
    }

</script>

<style>
    .image-crop-upload {
        display: inline-block;
        border: 1px dashed #666;
        border-radius: 6px;
        cursor: pointer;
    }

    .upload-block {
        position: relative;
        overflow: hidden;
        width: 270px;
        height: 170px;
        color: #999;
    }

    .upload-block:hover {
        border-color: #20a0ff;
        color: #666;
    }

    .upload-tip {
        font-size: 14px;
        text-align: center;
        line-height: 1.5em;
    }

    .upload-tip i {
        font-size: 28px;
        display: block;
        margin: 60px 0 30px;
    }

    .img-oper-container {
        position: relative;
        display: block;
        width: 240px;
        height: 180px;
        background-color: #e5e5e0;
        overflow: hidden;
        border: 1px solid #ccc;
    }

    .img-oper-container .vicp-img {
        position: absolute;
        display: block;
        cursor: move;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    .img-oper-container .vicp-img-shade {
        -webkit-box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.18);
        box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.18);
        position: absolute;
        background-color: rgba(241, 242, 243, 0.8);
    }

    .img-oper-container .vicp-img-shade.vicp-img-shade-1 {
        top: 0;
        left: 0;
    }

    .img-oper-container .vicp-img-shade.vicp-img-shade-2 {
        bottom: 0;
        right: 0;
    }

    .img-preview-container {
        border: 1px solid #ccc;
        margin-bottom: 20px;
    }

    .img-preview-container img {
        display: block;
    }

    .upload-image {
        display: block;
    }

</style>

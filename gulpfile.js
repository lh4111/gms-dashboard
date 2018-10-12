var gulp = require('gulp');
var sftp = require('gulp-sftp');

// FTP账号密码配置在项目更目录下 .ftppass 文件中
const sftpOption = {
  host: '120.76.72.147', // FTP主机地址
  auth: 'firefilm', // .ftppass 里面对应的授权方式
  remotePath: '/data/www/admin.firefilm.cc', // FTP需要上传的位置
}

gulp.task('upload', function () {
    return gulp.src('dist/**')
        .pipe(sftp(sftpOption));
});

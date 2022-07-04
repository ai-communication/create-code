var gulp = require('gulp');
var isChanged = require('gulp-changed');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var gcmq = require('gulp-group-css-media-queries');
var csscomb = require('gulp-csscomb'); //cssプロパティ順序
var notify = require('gulp-notify');
var rename = require('gulp-rename');
var cleanCSS = require('gulp-clean-css');
var plumber = require('gulp-plumber');
var sassGlob = require('gulp-sass-glob');
sass.compiler = require('sass');
var webp = require('gulp-webp');

var FtpDeploy = require('ftp-deploy');
var ftpDeploy = new FtpDeploy();

// Sass compile task
gulp.task('scss', function (done) {
  return gulp
    .src('./src/scss/**/*.scss') // コンパイル対象 scss
    .pipe(sassGlob())
    .pipe(
      sass({
        fibers: 'fibers',
      })
    )
    .pipe(
      plumber({
        errorHandler: notify.onError('Error: &lt;%= error.message %&gt;'),
      })
    )
    .pipe(csscomb())
    .pipe(
      autoprefixer({
        // ☆IEは11以上、Androidは4.4以上
        // その他は最新2バージョンで必要なベンダープレフィックスを付与する設定
        overrideBrowserslist: ['last 2 versions', 'ie >= 11', 'Android >= 6'],
        grid: 'autoplace',
      })
    )
    .pipe(gcmq())
    .pipe(gulp.dest('./assets/css')); // 出力
  done();
});

// .min.css generate task
gulp.task('mincss', function (done) {
  return gulp
    .src(['./assets/css/**/*.css', '!./assets/css/**/*.min.css']) //上のタスクで生成した css
    .pipe(cleanCSS()) // css 圧縮
    .pipe(
      rename({
        extname: '.min.css',
      })
    ) // .min.css にリネーム
    .pipe(gulp.dest('./assets/css')) // min.css 出力
    .pipe(
      notify({
        title: 'compiled!',
        message: new Date(),
        sound: 'Pop',
      })
    );
  done();
});

gulp.task('webp', function (done) {
  return gulp
    .src('src/**/*.+(jpg|jpeg|png)')
    .pipe(isChanged('assets/images'))
    .pipe(webp())
    .pipe(gulp.dest('assets/images'));
  done();
});

gulp.task('scssmin', function (done) {
  // scss watch & ftp deploy
  gulp.watch('./src/scss/**/*.scss', gulp.series('scss', 'mincss' /*, 'ftp'*/));
  done();
});

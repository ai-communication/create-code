var gulp = require('gulp');
var isChanged = require('gulp-changed');
var svgmin = require('gulp-svgmin');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
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

gulp.task('svgmin', function (done) {
  gulp
    .src('src/**/*.+(svg)')
    .pipe(isChanged('dist'))
    .pipe(svgmin())
    .pipe(gulp.dest('dist'));
  done();
});

// Sass compile task
gulp.task('scss', function (done) {
  return gulp
    .src('./assets/css/**/*.scss') // コンパイル対象 scss
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
    .pipe(isChanged('dist'))
    .pipe(webp())
    .pipe(gulp.dest('dist'));
  done();
});

gulp.task('default', function (done) {
  // scss watch & ftp deploy
  gulp.watch(
    './assets/css/**/*.scss',
    gulp.series('scss', 'mincss' /*, 'ftp'*/)
  );
  //gulp.watch(['src/**/*.*'], gulp.series('webp', 'svgmin')); //src部分は適宜環境に合わせて修正
  done();
});

var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var angularTemplates = require('gulp-angular-templates');
var del = require('del');
var uglify = require('gulp-uglify');
var runSequence = require('run-sequence');
var connect = require('gulp-connect');

gulp.task('clear:dist', function(done) {
    del('./dist', done);
});

gulp.task('clear:example', function(done) {
    del(['./examples/js/angularSpotlight.min.js','./examples/css/*.min.css', './examples/templates'], done);
});

gulp.task('copy:static', function () {
    return gulp.src(['./src/img/*.*'])
        .pipe(gulp.dest('./dist/'));
});

gulp.task('copy:static:example', function() {
    gulp.src('./dist/*.css')
        .pipe(gulp.dest('./examples/css/'));

    gulp.src('./dist/*.js')
        .pipe(gulp.dest('./examples/js/'));

    gulp.src('./src/templates/*.html')
        .pipe(gulp.dest('./examples/templates/'));
});

gulp.task('compile:angular:template', function () {
    return gulp.src('./src/spotlight/directive/*.html')
        .pipe(angularTemplates({module: 'de.devjs.angular.spotlight', basePath: 'spotlight/directive/'}))
        .pipe(gulp.dest('./src/spotlight/directive/'));
});

gulp.task('compile:sass', function() {
    return gulp.src('./src/scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(minifyCss())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/'))
        .pipe(connect.reload());
});

gulp.task('compile:js', ['compile:angular:template'], function() {
    return gulp.src(['./vendors/**/*.js','./src/**/*.js'])
        .pipe(concat('angularSpotlight.js'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('compress:js', ['compile:js'], function() {
  return gulp.src('./dist/angularSpotlight.js')
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/'))
    .pipe(connect.reload());
});

gulp.task('watch', function () {
    return gulp.watch(['./src/**/*.scss', './src/**/*.js'], ['build:example']);
});

gulp.task('build', function(done) {
    runSequence('clear:dist', ['compile:js', 'compress:js', 'compile:sass', 'copy:static'], done);
});

gulp.task('build:example', ['build'], function(done) {
    runSequence('clear:example', 'copy:static:example', done);
});

gulp.task('connect', ['build:example'], function() {
  connect.server({
    root: 'examples',
    port: 8001,
    livereload: true,
    open: {
      browser: 'Google Chrome'
    }
  });
});

gulp.task('serve', ['connect', 'watch']);
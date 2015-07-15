var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var angularTemplates = require('gulp-angular-templates');
var del = require('del');

gulp.task('clear:dist', function(done) {
    del('./dist', done);
});

gulp.task('copy:static', function () {
    return gulp.src('./src/img/*.*')
        .pipe(gulp.dest('./dist/'));
});

gulp.task('html', function () {
    return gulp.src('src/angularSpotlightTemplate.html')
        .pipe(angularTemplates({module: 'de.stekoe.angular.spotlight'}))
        .pipe(gulp.dest('./src/'));
});

gulp.task('compile:sass', function() {
    return gulp.src('./src/scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(minifyCss())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('watch:sass', function () {
    return gulp.watch('./src/**/*.scss', ['compile:sass']);
});

gulp.task('compile:js', ['html'], function() {
    return gulp.src('./src/**/*.js')
        .pipe(concat('angularSpotlight.min.js'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('build', ['compile:js', 'compile:sass', 'copy:static'], function() {
});
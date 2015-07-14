var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('compile:sass', function() {
    return gulp.src('./template/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./template/'));
});

gulp.task('watch:sass', function () {
    return gulp.watch('./template/**/*.scss', ['compile:sass']);
});
var gulp = require('gulp');
var gulpShell = require('gulp-shell');

var watch = require('gulp-watch');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var browserify = require('browserify');

var jasmine = require('gulp-jasmine');

gulp.task('browserify', function() {
  // TODO
});

gulp.task('default', []);
gulp.task('test', []);
gulp.task('build', []);

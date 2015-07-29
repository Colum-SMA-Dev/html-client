'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var path = require('path');
var gulpif = require('gulp-if');
var template = require('gulp-template');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var sourcemaps = require('gulp-sourcemaps');
var mergeStream = require('merge-stream');
var objectAssign = require('object-assign');
var browserify = require('browserify');
var envify = require('envify');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat'),
    livereload = require('gulp-livereload'),
    dest = 'dist',
    lvPort = 35729;

var cssGlobs = ['src/css/**/*.css'];

var static_server = require('./static_server');

/*
 only uglify in production.  Since chrome inspector doesn't support source map
 variable names, debugging sucks when minified
 https://code.google.com/p/chromium/issues/detail?id=327092
*/
var production = process.env.NODE_ENV === 'production';
if (production) {
    gutil.log('making production build');
}

/*
  I don't want to have to define the browserify code twice.  Yet, I need it to run inside
  of watchify, and then I also want to run it manually for the 'build' task.  So I have to 
  abstract out the process of making a bundler, and then leave it open to manual triggering
*/

var htmlClientBundler = bundlerBuilder('./src/js/index.js', 'index.js');

function bundlerBuilder (startPath, finishName, useReactify) {
    var bundler = watchify(browserify(startPath, objectAssign({debug: true}, watchify.args)));
    
    bundler.transform(envify);
    bundler.on('log', gutil.log);

    var rebundle = function() {
        return bundler.bundle()
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))
            .pipe(source(finishName))
            .pipe(gulpif(production, buffer()))
            .pipe(gulpif(production, sourcemaps.init({loadMaps: true})))
            .pipe(gulpif(production, uglify()))
            .pipe(gulpif(production, sourcemaps.write('./')))
            .pipe(gulp.dest('dist/js'));
    };

    return {bundler: bundler, rebundle: rebundle};
}

gulp.task('watch', function () { 
    // trigger livereload on any change to dest
    livereload.listen(lvPort);
    gulp.watch(dest + '/**').on('change', livereload.changed);

    // html changes
    gulp.watch('src/*.html', ['html']);

    // css changes
    gulp.watch(cssGlobs, ['css']);

    
    htmlClientBundler.bundler.on('update', htmlClientBundler.rebundle);
});

gulp.task('html', function() {
    return gulp.src('src/*.html')
        .pipe(template({polyfillFeatures: 'Element.prototype.classList,Object.create'}))
        .pipe(gulp.dest('dist'));
});

gulp.task('css', function() {
    return gulp.src(cssGlobs)
        .pipe(gulp.dest(dest + '/css'));
});

gulp.task('bundlejs', function() {
    return mergeStream(
        htmlClientBundler.rebundle()
    );
});

gulp.task('build-dist', ['bundlejs', 'html', 'css']);


///// BEGIN CLI TASKS ////////////////////////////////

gulp.task('build', ['build-dist'], function() {
    // watchify watch handles must be closed, otherwise gulp task will hang,
    // thus the .on('end', ...)
    htmlClientBundler.bundler.close();
});

gulp.task('serve', function(next) {
    static_server(dest, {callback: next, livereload: true});
});

gulp.task('default', ['build-dist', 'serve', 'watch']);

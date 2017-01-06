'use strict';

var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var sequence = require('run-sequence');


gulp.task('dev', function (cb) {
	
	var started = false;
	
	return nodemon({
		script: 'src/index.js'
	}).on('start', function () {
		// to avoid nodemon being started multiple times
		if (!started) {
			cb();
			started = true; 
		} 
	});
});

gulp.task('test', []);

//'Builds source code: validates it and provides an artifacts'
gulp.task('build', function (done) {
//   sequence( 'test', 'compress', done);
});

//'Being run automatically on a git pre-commit hook'
gulp.task('pre-commit', ['build']);

gulp.task('default', ['build']);


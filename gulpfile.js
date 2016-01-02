var gulp = require('gulp')
var source = require('vinyl-source-stream')
var browserify = require('browserify')
var watchify = require('watchify')
var babelify = require('babelify')
var concat = require('gulp-concat')
var sass = require('gulp-sass')
var livereload = require('gulp-livereload')
var http = require('http')
var st = require('st')

// Enable livereload in the browser (http://livereload.com/extensions/)
livereload({start: true})

// Log errors in the watchers to the console
function handleErrors () {
  var args = Array.prototype.slice.call(arguments)
  console.error('Error in watcher!', args)
}

// Compile the javascript and watch for file changes
gulp.task('browserify', function () {
  // Give browserify the initial file, it automatically grabs the dependencies
  // We also wanna convert JSX to javascript, transpile es6, and turn on source mapping
  var bundler = browserify({
    entries: ['./app/index.jsx'],
    transform: [[babelify, {'presets': ['es2015', 'stage-0', 'react']}]],
    debug: true,
    cache: {},
    packageCache: {},
    fullPaths: true
  })
  var watcher = watchify(bundler, { poll: true })

  function compileJS () {
    console.time('Compiling JS')
    watcher.bundle()
      .on('error', handleErrors)
      .pipe(source('bundle.js'))
      .pipe(gulp.dest('./public/build/'))
      .pipe(livereload())
    console.timeEnd('Compiling JS')
  }

  // Listen for updates and run one time for the initial task
  watcher.on('update', compileJS)
  return compileJS()
})

// Compile SCSS into CSS on file changes
gulp.task('scss', function () {
  function compileSCSS () {
    console.time('Compiling CSS')
    gulp.src('./styles/**/*.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(concat('bundle.css'))
      .pipe(gulp.dest('./public/build/'))
      .pipe(livereload())
    console.timeEnd('Compiling CSS')
  }

  // Listen for updates and run one time for the initial task
  gulp.watch('./styles/**/*.scss', compileSCSS)
  compileSCSS()
})

// Create a simple static server serving all the resources
gulp.task('server', function () {
  http.createServer(st({path: __dirname + '/public', index: 'index.html', cache: false})).listen(8000)
})

// Just run all tasks
gulp.task('default', ['browserify', 'scss', 'server'])

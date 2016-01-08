var gulp = require('gulp')
var source = require('vinyl-source-stream')
var browserify = require('browserify')
var watchify = require('watchify')
var babelify = require('babelify')
var notifier = require('node-notifier')
var chalk = require('chalk')
var concat = require('gulp-concat')
var sass = require('gulp-sass')
var livereload = require('gulp-livereload')
var http = require('http')
var st = require('st')

// Enable livereload in the browser (http://livereload.com/extensions/)
livereload({start: true})

// Log errors in the watchers to the console
var failing = false
function handleErrors (error) {
  // Save the error status for the compile functions
  failing = true

  // Generate a clean error message
  var regex = new RegExp(__dirname.replace(/\\/g, '[\\\\\/]*'), 'gi')
  error = error.toString().replace(regex, '')

  // Write in console and notify the user
  console.log(chalk.bold.red('[Build failed] ' + error))
  notifier.notify({
    title: 'Gulp build failed',
    message: error,
    sound: true
  })
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
    var start = Date.now()
    watcher.bundle()
      .on('error', handleErrors)
      .pipe(source('bundle.js'))
      .pipe(gulp.dest('./public/build/'))
      .pipe(livereload())
    var ms = Date.now() - start
    console.log(chalk.green('Compiled JS in %dms'), ms)

    if (failing) {
      failing = false
      notifier.notify({
        title: 'Gulp build passed!',
        message: 'Compiled JS',
        sound: true
      })
    }
  }

  // Listen for updates and run one time for the initial task
  watcher.on('update', compileJS)
  return compileJS()
})

// Compile SCSS into CSS on file changes
gulp.task('scss', function () {
  function compileSCSS () {
    var start = Date.now()
    gulp.src('./styles/**/*.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(concat('bundle.css'))
      .pipe(gulp.dest('./public/build/'))
      .pipe(livereload())
    var ms = Date.now() - start
    console.log(chalk.green('Compiled CSS in %dms'), ms)

    if (failing) {
      failing = false
      notifier.notify({
        title: 'Gulp build passed!',
        message: 'Compiled CSS',
        sound: true
      })
    }
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

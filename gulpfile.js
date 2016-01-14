var gulp = require('gulp')
var gutil = require('gulp-util')
var manifest = require('gulp-manifest')
var signalhub = require('signalhub/server.js')
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

// Log errors in the watchers to the console
var failing = false
function handleErrors (error) {
  // Save the error status for the compile functions
  failing = true

  // Generate a clean error message
  var regex = new RegExp(__dirname.replace(/\\/g, '[\\\\\/]*'), 'gi')
  error = error.toString().replace(regex, '')

  // Write in console and notify the user
  gutil.log(chalk.bold.red('[Build failed] ' + error))
  notifier.notify({
    title: 'Gulp build failed',
    message: error,
    sound: true
  })
}

// Log successful tasks
function handleSuccess (start, message) {
  var ms = Date.now() - start
  message = message + ' in ' + ms + 'ms'
  gutil.log(chalk.green(message))

  if (failing) {
    failing = false
    notifier.notify({
      title: 'Gulp build passed!',
      message: message,
      sound: true
    })
  }
}

// Compile the javascript and watch for file changes
function browserifyTask (deploy) {
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

  var watcher = deploy === true ? bundler : watchify(bundler, { poll: true })

  function compileJS () {
    var start = Date.now()
    var pipe = watcher.bundle()
      .on('error', handleErrors)
      .pipe(source('bundle.js'))
      .pipe(gulp.dest('./public/build/'))

    if (!deploy) {
      pipe.pipe(livereload())
    }

    handleSuccess(start, 'Compiled JS')
  }

  // Listen for updates
  if (!deploy) {
    watcher.on('update', compileJS)
  }

  // Run once on task execution
  return compileJS()
}

// Compile SCSS into CSS on file changes
function scssTask (deploy) {
  function compileSCSS () {
    var start = Date.now()
    var pipe = gulp.src('./styles/**/*.scss')
      .pipe(sass().on('error', handleErrors))
      .pipe(concat('bundle.css'))
      .pipe(gulp.dest('./public/build/'))

    if (!deploy) {
      pipe.pipe(livereload())
    }

    handleSuccess(start, 'Compiled CSS')
  }

  // Listen for updates
  if (!deploy) {
    gulp.watch('./styles/**/*.scss', compileSCSS)
  }

  // Run once on task execution
  compileSCSS()
}

// Create a appcache file from our `public/` directory
gulp.task('manifest', function () {
  gulp.src(['public/*'], {base: './'})
    .pipe(manifest({
      hash: true,
      preferOnline: true,
      network: [],
      filename: 'app.manifest',
      exclude: 'app.manifest'
    }))
    .pipe(gulp.dest('public'))
})

// Start signalhub server on port 7000
function startSignalhub () {
  var port = 7000
  var host = ''
  var server = signalhub()

  server.on('subscribe', function (channel) {
    gutil.log('subscribe: %s', channel)
  })

  server.on('publish', function (channel, message) {
    gutil.log('broadcast: %s (%d)', channel, message.length)
  })

  server.listen(port, host, function () {
    gutil.log('signalhub listening on port %d', server.address().port)
  })
}

// Start normal server on port 8000
function startServer () {
  http.createServer(st({path: __dirname + '/public', index: 'index.html', cache: false})).listen(8000)
  gutil.log('server listening on port %d', 8000)
}

// Enable livereload in the browser (http://livereload.com/extensions/)
// and just start all the watchers and the server
gulp.task('default', function () {
  livereload({start: true})
  browserifyTask()
  scssTask()
  startSignalhub()
  startServer()
})

// Create the assets once, without watchers
gulp.task('deploy', function () {
  browserifyTask(true)
  scssTask(true)
  manifest()
})

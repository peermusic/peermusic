var gulp = require('gulp')
var source = require('vinyl-source-stream') // Used to stream bundle for further handling
var browserify = require('browserify')
var watchify = require('watchify')
var reactify = require('reactify')
var concat = require('gulp-concat')
var sass = require('gulp-sass')
var livereload = require('gulp-livereload')
var http = require('http')
var st = require('st')

livereload({start: true})

// Compile the javascript and watch for file changes
gulp.task('browserify', function () {
  // Give browserify the initial file, it automatically grabs the depenencies
  // We also wanna convert JSX to javascript and turn on source mapping
  var bundler = browserify({
    entries: ['./app/index.js'],
    transform: [reactify],
    debug: true,
    cache: {},
    packageCache: {},
    fullPaths: true
  })
  var watcher = watchify(bundler, { poll: true })

  return watcher
    .on('update', function () {
      console.log('Compiling JS!')
      watcher.bundle()
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./public/build/'))
        .pipe(livereload())
    })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./public/build/'))
})

// Compile SCSS into CSS on file changes
gulp.task('scss', function () {
  function compileSCSS () {
    console.log('Compiling SCSS!')
    return gulp.src('./styles/**/*.scss')
      .pipe(sass().on('error', sass.logError))
      .pipe(concat('bundle.css'))
      .pipe(gulp.dest('./public/build/'))
      .pipe(livereload())
  }

  gulp.watch('./styles/**/*.scss', compileSCSS)
  compileSCSS()
})

// Create a simple static server serving all the resources
gulp.task('server', function () {
  http.createServer(st({path: __dirname + '/public', index: 'index.html', cache: false})).listen(8000)
})

// Just run all tasks
gulp.task('default', ['browserify', 'scss', 'server'])

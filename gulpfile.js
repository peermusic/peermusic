var gulp = require('gulp');
var source = require('vinyl-source-stream'); // Used to stream bundle for further handling
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var livereload = require('gulp-livereload');
var http = require('http');
var st = require('st');

livereload({start: true})

gulp.task('browserify', function () {
    var bundler = browserify({
        entries: ['./app/index.js'], // Only need initial file, browserify finds the deps
        transform: [reactify], // We want to convert JSX to normal javascript
        debug: true, // Gives us sourcemapping
        cache: {}, packageCache: {}, fullPaths: true // Requirement of watchify
    });
    var watcher = watchify(bundler);

    return watcher
            .on('update', function () { // When any files update
                var updateStart = Date.now();
                console.log('Updating!');
                watcher.bundle() // Create new bundle that uses the cache for high performance
                        .pipe(source('bundle.js'))
                        .pipe(gulp.dest('./public/build/'))
                        .pipe(livereload());
                console.log('Updated!', (Date.now() - updateStart) + 'ms');
            })
            .bundle() // Create the initial bundle when starting the task
            .pipe(source('bundle.js'))
            .pipe(gulp.dest('./public/build/'));
});

// I added this so that you see how to run two watch tasks
gulp.task('scss', function () {
    function compileSCSS() {
        return gulp.src('./styles/*.scss')
                .pipe(sass().on('error', sass.logError))
                .pipe(concat('bundle.css'))
                .pipe(gulp.dest('./public/build/'))
                .pipe(livereload());
    }

    gulp.watch('./styles/*.scss', compileSCSS);
    compileSCSS();
});

gulp.task('server', function () {
    http.createServer(st({path: __dirname + '/public', index: 'index.html', cache: false})).listen(8080);
});

// Just running the two tasks
gulp.task('default', ['browserify', 'scss', 'server']);


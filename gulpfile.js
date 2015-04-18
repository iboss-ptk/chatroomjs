var gulp = require('gulp'),
    watch = require('gulp-watch'),
    rename = require('gulp-rename'),
    cache = require('gulp-cached'),
    plumber = require('gulp-plumber'),
    notify = require('gulp-notify'),

    Filter = require('gulp-filter'),
    // SASS
    sass = require('gulp-sass'),
    minify = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    // JADE
    jade = require('gulp-jade'),
    // COFFEESCRIPT
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat')

var root = './assets/';
var src = {
  sass: root + 'sass/*.sass',
  jade: root + 'jade/*.jade',
  js: root + 'js/*.js'
};

gulp.task('default', function() {
  watch(src.sass, { ignoreInitial: false }, function (files) {
    gulp.start('sass');
  });

  watch(src.jade, { ignoreInitial: false }, function (files) {
    gulp.start('jade');
  });

  watch(src.js, { ignoreInitial: false }, function (files) {
    gulp.start('js');
  });
});

gulp.task('min', function () {
  gulp.start('sass-min');
  gulp.start('jade');
  gulp.start('js-min');
});

gulp.task('sass', function() {
  var dest = root + 'css-concat/';
  var once = true;
  return gulp.src(src.sass)
    // .pipe(cache('sass'))
    // .pipe(sourcemaps.init())
    .pipe(plumber({ errorHandler: function (err) {
      console.log(err.toString());
      this.emit('end');
    } }))
    .pipe(sass({ indentedSyntax: true }))
    .pipe(autoprefixer())
    .pipe(concat('app.css'))
    .pipe(gulp.dest(dest))
    .pipe(plumber.stop())
    .pipe(notify(function () {
      if (once) {
        once = false;
        return 'SASS Finished..';
      }
      return null;
    }));
    // .pipe(notify('SASS Finished!'))
    // .pipe(rename({ suffix: '.min' }))
    // .pipe(minify())
    // .pipe(gulp.dest(dest));
});

// css minified without sourcemaps
gulp.task('sass-min', function () {
  var dest = root + 'css/';
  var once = true;
  return gulp.src(src.sass)
    .pipe(plumber({ errorHandler: function (err) {
      console.log(err.toString());
      this.emit('end');
    } }))
    .pipe(sass({ indentedSyntax: true }))
    .pipe(autoprefixer())
    .pipe(minify())
    .pipe(gulp.dest(dest))
    .pipe(plumber.stop())
    .pipe(notify(function () {
      if (once) {
        once = false;
        return 'SASS-min Finished..';
      }
      return null;
    }));
});

gulp.task('jade', function () {
  var dest = root + 'html/';
  var once = true;
  return gulp.src(src.jade)
    .pipe(cache('jade'))
    .pipe(plumber({ errorHandler: function (err) {
      console.log(err.toString());
      this.emit('end');
    } }))
    .pipe(jade())
    .pipe(gulp.dest(dest))
    .pipe(Filter([ '**/app.html' ]))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('./'))
    .pipe(plumber.stop())
    .pipe(notify(function () {
      if (once) {
        once = false;
        return 'Jade Finished..';
      }
      return null;
    }));
});

gulp.task('js', function () {
  var dest = root + 'js-concat/';
  var once = true;
  return gulp.src(src.js)
    .pipe(plumber({ errorHandler: function (err) {
      console.log(err.toString());
      this.emit('end');
    } }))
    .pipe(concat('app.js'))
    // .pipe(uglify())
    .pipe(gulp.dest(dest))
    .pipe(plumber.stop())
    .pipe(notify(function () {
      if (once) {
        once = false;
        return 'JS Finished..';
      }
      return null;
    }));
});

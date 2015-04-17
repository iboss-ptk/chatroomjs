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
    coffee = require('gulp-coffee'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat')

var root = './assets/';
var src = {
  sass: root + 'sass/*.sass',
  jade: root + 'jade/*.jade',
  coffee: root + 'coffee/*.coffee'
};

gulp.task('default', function() {
  watch(src.sass, { ignoreInitial: false }, function (files) {
    gulp.start('sass');
  });

  watch(src.jade, { ignoreInitial: false }, function (files) {
    gulp.start('jade');
  });

  watch(src.coffee, { ignoreInitial: false }, function (files) {
    gulp.start('coffee');
  });
});

gulp.task('min', function () {
  gulp.start('sass-min');
  gulp.start('jade');
  gulp.start('coffee-min');
});

gulp.task('sass', function() {
  var dest = root + 'css/';
  var once = true;
  return gulp.src(src.sass)
    .pipe(cache('sass'))
    .pipe(sourcemaps.init())
    .pipe(plumber({ errorHandler: function (err) {
      console.log(err.toString());
      this.emit('end');
    } }))
    .pipe(sass({ indentedSyntax: true }))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('./maps'))
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

gulp.task('coffee', function () {
  var dest = root + 'js/';
  var once = true;
  return gulp.src(src.coffee)
    .pipe(sourcemaps.init())
    .pipe(plumber({ errorHandler: function (err) {
      console.log(err.toString());
      this.emit('end');
    } }))
    .pipe(coffee({ bare: true }))
    .pipe(concat('app.js'))
    // .pipe(uglify())
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest(dest))
    .pipe(plumber.stop())
    .pipe(notify(function () {
      if (once) {
        once = false;
        return 'Coffee Finished..';
      }
      return null;
    }));
});

// coffee min without source maps
gulp.task('coffee-min', function () {
  var dest = root + 'js/';
  var once = true;
  return gulp.src(src.coffee)
    .pipe(plumber({ errorHandler: function (err) {
      console.log(err.toString());
      this.emit('end');
    } }))
    .pipe(coffee({ bare: true }))
    .pipe(concat('app.js'))
    .pipe(uglify())
    .pipe(gulp.dest(dest))
    .pipe(plumber.stop())
    .pipe(notify(function () {
      if (once) {
        once = false;
        return 'Coffee-min Finished..';
      }
      return null;
    }));
});

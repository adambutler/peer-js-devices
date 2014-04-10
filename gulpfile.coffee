gulp = require("gulp")
coffee = require("gulp-coffee")
concat = require("gulp-concat")
uglify = require("gulp-uglify")

paths =
  src: ["src/**/*.coffee"]
  dist: "dist"

gulp.task "build", ->
  
  gulp
    .src(paths.src)
    .pipe(coffee())
    .pipe(concat("index.js"))
    .pipe gulp.dest(paths.dist)
    .pipe(uglify())
    .pipe(concat("index.min.js"))
    .pipe gulp.dest(paths.dist)

gulp.task "watch", ->
  gulp.watch src, ["build"]

gulp.task "default", ["build"]

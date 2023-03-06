const { task, src, dest, series } = require("gulp"),
  concat = require("gulp-concat"),
  cleanCSS = require("gulp-clean-css"),
  minify = require("gulp-minify"),
  imagemin = require("gulp-imagemin"),
  pngquant = require("imagemin-pngquant"),
  htmlmin = require("gulp-htmlmin"),
  del = require("del");

// Concat CSS
task("concat-css", () => {
  return src(["css/bootstrap.min.css", "css/style.css"])
    .pipe(concat("style.min.css"))
    .pipe(dest("css/"));
});

// Minify CSS
task("minify-css", () => {
  return src("css/style.min.css").pipe(cleanCSS()).pipe(dest("build/css/"));
});

// Concat JS
task("concat-js", () => {
  return src(["js/jquery.min.js", "js/script.js"])
    .pipe(concat("script.min.js"))
    .pipe(dest("js/"));
});

// Minify JS
task("minify-js", () => {
  return src(["js/background.js", "js/script.min.js"])
    .pipe(minify())
    .pipe(dest("build/js/"));
});

// Minify Image
task("image", () => {
  return src("img/*")
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        use: [pngquant()],
      })
    )
    .pipe(dest("build/img/"));
});

// Minify HTML
task("html", () => {
  return src("index.html")
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        removeComments: true,
      })
    )
    .pipe(dest("build/"));
});

// Clean output directory
task("clean", () => del("build"));

// Copy files
task("copy", () => {
  return src("manifest.json").pipe(dest("build/"));
});

// Run all
task(
  "default",
  series([
    "clean",
    "copy",
    "concat-css",
    "minify-css",
    "concat-js",
    "minify-js",
    "image",
    "html",
  ])
);

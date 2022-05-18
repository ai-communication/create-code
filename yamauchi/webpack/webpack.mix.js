let mix = require("laravel-mix");
let path = require("path");
let glob = require("glob");
require("laravel-mix-webp-watched");

glob
  .sync("src/scss/**/*.scss", { ignore: "src/scss/**/_*.scss" })
  .map(function (file) {
    mix
      .sass(file, "assets/css")
      .options({
        processCssUrls: false, // scss内のパスを記載した通りに出力する
        postCss: [
          // postCSSのプラグイン読み込み＆設定
          require("css-mqpacker")(),
          require("css-declaration-sorter")({
            order: "smacss",
          }),
        ],
        autoprefixer: {
          // autoprefixerの設定変更
          options: {
            browsers: ["last 2 versions"],
            cascade: false,
          },
        },
      })
      .sourceMaps();
  });

mix
  .disableNotifications() // デスクトップ通知をoff
  .webpackConfig({
    module: {
      // scss内で@import "layout/*"を使える用にする
      rules: [
        {
          test: /\.scss/,
          enforce: "pre",
          loader: "import-glob-loader",
        },
      ],
    },
  })
  .webpWatched("src/images", "assets/images");

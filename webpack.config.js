module.exports = {
  module: {
    rules: [
      {
        test: /\.coffee$/,
        loader: "coffee-loader",
      },
      {
        test: /\.pug$/,
        loader: 'pug-plain-loader',
        exclude: /node_modules/,
        options: {
          transpile: {
            presets: ["@babel/env"],
          },
        },
      },
    ],
  },
};
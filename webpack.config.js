const path = require('path');

module.exports = {
  entry: {
    //"profile":"./src/apps/profile/index.js",
    "practice-management":"./src/apps/practiceManagement/index.js",
    //"payment-management":"./src/apps/paymentManagement/index.js",
    // "subscription-management":"./src/apps/subscriptionManagement/index.js",
    "appointments":"./src/apps/appointments/index.js"
  },
  output: {
    path: path.resolve(__dirname, 'src/dist'),
    filename: '[name].bundle.js',
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
      },{
        test: /\.css$/i,
        use: ["style-loader", "css-loader"] 
      }
    ]
  }
};
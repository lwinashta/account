const path = require('path');

module.exports = {
  entry: {
    "app":"./src/components/index.js"
    //"profile":"./src/components/profile/index.js",
    // "practice-management":"./src/apps/practiceManagement/index.js",
    // "payment-management":"./src/apps/paymentManagement/index.js",
    // "subscription-management":"./src/apps/subscriptionManagement/index.js",
    // "appointments":"./src/apps/appointments/index.js"
  },
  output: {
    path: path.resolve(__dirname, 'src/dist'),
    filename: '[name].bundle.js',
  },
  mode: 'development',
  resolve:{
    alias:{
      "form-module":path.resolve(__dirname, '../efs/form'),
      "account-manager-module":path.resolve(__dirname, '../efs/accountManager'),
      "fileManagement-module":path.resolve(__dirname, '../efs/fileManagement'),
      "core":path.resolve(__dirname, '../efs/core')
    },
    modules: [path.resolve(__dirname, './node_modules'),'node_modules']
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env','@babel/preset-react'],
              plugins: ['@babel/plugin-transform-runtime']
            }
          }
      },{
        test: /\.css$/i,
        use: ["style-loader", "css-loader"] 
      }
    ]
  }
};
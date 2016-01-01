var webpack = require('webpack');
module.exports = {
    entry: [
      "./web/js/app.js"
    ],
    output: {
        path: './web/build',
        filename: "bundle.js"
    },
    module: {
        loaders: [
            { test: /\.js?$/, loaders: ['react-hot', 'babel'], exclude: /node_modules/ },
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}
        ]
    },
    resolve:{
        extensions:['','.js','.json']
    },
    plugins: [
      new webpack.NoErrorsPlugin()
    ],
    watch: true
};
/*'webpack/hot/only-dev-server',*/

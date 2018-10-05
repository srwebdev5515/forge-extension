var webpack = require('webpack')
var path = require('path')

module.exports = {

    devtool: false,

    entry: {

        'Viewing.Extension.Transform':
            './src/Viewing.Extension.Transform/Viewing.Extension.Transform.js',

    },

    output: {
      path: path.join(__dirname, '../../moicon-forge/app/resources/app/js/forgeviewer/extensions'),
      filename: "[name]/[name].min.js",
      libraryTarget: "umd",
      library: "[name]"
    },

    plugins: [

        new webpack.NoErrorsPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),

        new webpack.optimize.MinChunkSizePlugin({
            minChunkSize: 51200
        }),

        new webpack.optimize.UglifyJsPlugin({
            output: {
                comments: false
            },
            compress: {
                warnings: false
            },
            minimize: true,
            mangle: true
        }),

        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"'
        }),

        new webpack.ProvidePlugin({
            'window.jQuery': 'jquery',
            jQuery: 'jquery',
            _: 'lodash',
            $: 'jquery'
        })
    ],

    resolve: {
        extensions: ['', '.js', '.jsx', '.json', '.ts'],
        root: [
            path.resolve('./src/components'),
            path.resolve('./src/Viewing.Extension.Particle'),
            path.resolve('./src/Viewing.Extension.Transform')
        ]
    },

    module: {

        loaders: [
            {
                test: /\.json$/,
                loader: 'json-loader'
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                  cacheDirectory: true,
                  presets: ['es2015', 'stage-0', 'react'],
                  plugins: ['transform-runtime']
                }
            },
            { test: /\.scss$/, loaders: ["style", "css", "sass"] },
            { test: /\.less$/, loader: "style!css!less" },
            { test: /\.css$/, loader: "style-loader!css-loader" },
            { test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
            { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream' },
            { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file' },
            { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml' },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [
                    'file?hash=sha512&digest=hex&name=[hash].[ext]',
                    'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
                ]
            }
        ]
    }
}

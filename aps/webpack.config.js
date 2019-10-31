const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ImageminWebpackPlugin = require('imagemin-webpack-plugin').default;
const WebpackManifestPlugin = require('webpack-manifest-plugin');
const BeforeBuildWebpackPlugin = require('before-build-webpack');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const BrotliWebpackPlugin = require('brotli-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const LiveReloadPlugin = require('webpack-livereload-plugin');
const MergeJsonWebpackPlugin = require('merge-jsons-webpack-plugin');
const WebpackBar = require('webpackbar');



// module.exports = configs.filter(cfg => cfg !== null);


module.exports = (env, argv) => {
    const devMode = process.env.NODE_ENV === 'development' || argv.mode === 'development';
    const watcherEnabled = argv.watch !== false;

    const configs = [];

    const createConfig = (rootPath) => {
        if (!fs.existsSync(path.resolve(__dirname, rootPath, 'js')) || !fs.existsSync(path.resolve(__dirname, rootPath, 'package.json'))) {
            return null;
        }

        const filesToCopy = [
            {
                from: rootPath + 'images/**',
                to: './',
                transformPath(targetPath, absolutePath) {
                    return targetPath.substr(targetPath.indexOf('images/'));
                }
            },
            {
                from: rootPath + 'images/**',
                to: './[path]/[name].[hash].[ext]',
                transformPath(targetPath, absolutePath) {
                    return targetPath.substr(targetPath.indexOf('images/'));
                }
            },
            {
                from: rootPath + 'fonts/**',
                to: './',
                transformPath(targetPath, absolutePath) {
                    return targetPath.substr(targetPath.indexOf('fonts/'));
                }
            },
            {
                from: rootPath + 'fonts/**',
                to: './[path]/[name].[hash].[ext]',
                transformPath(targetPath, absolutePath) {
                    return targetPath.substr(targetPath.indexOf('fonts/'));
                }
            },
            {
                from: rootPath + 'extras/**',
                to: './',
                transformPath(targetPath, absolutePath) {
                    return targetPath.substr(targetPath.indexOf('extras/'));
                }
            }
        ];

        if (fs.existsSync(path.resolve(__dirname, rootPath, '../', 'fonts'))) { // has parent product/theme fonts
            filesToCopy.unshift(
                {
                    from: path.resolve(__dirname, rootPath, '../', 'fonts') + '/**',
                    to: './',
                    transformPath(targetPath, absolutePath) {
                        return targetPath.substr(targetPath.indexOf('fonts/'));
                    }
                },
                {
                    from: path.resolve(__dirname, rootPath, '../', 'fonts') + '/**',
                    to: './[path]/[name].[hash].[ext]',
                    transformPath(targetPath, absolutePath) {
                        return targetPath.substr(targetPath.indexOf('fonts/'));
                    }
                }
            );
        }

        if (fs.existsSync(path.resolve(__dirname, rootPath, 'node_modules/ui-theme/fonts'))) { // has parent product/theme fonts
            filesToCopy.unshift(
                {
                    from: path.resolve(__dirname, rootPath, 'node_modules/ui-theme/fonts') + '/**',
                    to: './',
                    transformPath(targetPath, absolutePath) {
                        return targetPath.substr(targetPath.indexOf('fonts/'));
                    }
                },
                {
                    from: path.resolve(__dirname, rootPath, 'node_modules/ui-theme/fonts') + '/**',
                    to: './[path]/[name].[hash].[ext]',
                    transformPath(targetPath, absolutePath) {
                        return targetPath.substr(targetPath.indexOf('fonts/'));
                    }
                }
            );
        }

        let uiCoreLocales = [];
        let themeLocales = [];
        let parentLocales = [];
        let productLocales = [];
        let localesConfig = [];
        const ux3LocalesPath = path.join(rootPath, 'node_modules/ui-core/locales');
        const themeLocalesPath = path.join(rootPath, 'node_modules/ui-theme/locales');
        const parentLocalesPath = path.join(rootPath, '../', 'locales');
        const productLocalesPath = path.join(rootPath, 'locales');

        if (fs.existsSync(ux3LocalesPath)) {
            uiCoreLocales = fs.readdirSync(ux3LocalesPath);
        }
        if (fs.existsSync(themeLocalesPath)) {
            themeLocales = fs.readdirSync(themeLocalesPath);
        }
        if (fs.existsSync(parentLocalesPath)) {
            parentLocales = fs.readdirSync(parentLocalesPath);
        }
        if (fs.existsSync(productLocalesPath)) {
            productLocales = fs.readdirSync(productLocalesPath);
        }

        let allLocales = (function (...locales) {
            let jointLocales = []
        
            locales.forEach(locale => {
                jointLocales = [...jointLocales, ...locale];
            })
            const uniqueLocales = jointLocales.filter((item, index) => jointLocales.indexOf(item) === index);
            return uniqueLocales;
        })(uiCoreLocales, themeLocales, parentLocales, productLocales);

        allLocales.forEach(locale => {
            let localeFiles = [];
            const ux3LocaleFile = path.join(ux3LocalesPath, locale);
            const themeLocaleFile = path.join(themeLocalesPath, locale);
            const parentLocaleFile = path.join(parentLocalesPath, locale);
            const productLocaleFile = path.join(productLocalesPath, locale);

            if (fs.existsSync(ux3LocaleFile)) {
                localeFiles.push(ux3LocaleFile);
            }
            if (fs.existsSync(themeLocaleFile)) {
                localeFiles.push(themeLocaleFile);
            }
            if (fs.existsSync(parentLocaleFile)) {
                localeFiles.push(parentLocaleFile);
            }
            if (fs.existsSync(productLocaleFile)) {
                localeFiles.push(productLocaleFile);
            }

            let localeGroup = {
                'pattern': localeFiles.length > 1 ? '{' + localeFiles.join(',') + '}' : localeFiles[0],
                'fileName': path.join('locales/', locale)
            };

            localesConfig.push(localeGroup);
        });

        const plugins = [
            new CleanWebpackPlugin(),
            new FriendlyErrorsWebpackPlugin(),
            new FixStyleOnlyEntriesPlugin(),
            new MiniCssExtractPlugin({
                filename: 'css/[name].[hash].css',
            }),
            new CopyWebpackPlugin(filesToCopy),
            new WebpackManifestPlugin({
                fileName: './manifest.json',
                filter: descriptor => {
                    return (descriptor.name.endsWith('.js') || descriptor.name.endsWith('.css')) && descriptor.name !== descriptor.path;
                },
                map: descriptor => {
                    descriptor.path = descriptor.path.substr(descriptor.path.lastIndexOf('/') + 1);
                    return descriptor;
                }
            }),
            new BeforeBuildWebpackPlugin(function(stats, callback) {
                let assetTypes = ['js', 'css'];
                assetTypes.map(type => {
                    fs.readdirSync(path.resolve(__dirname, rootPath, 'releasedAssets/', type)).map(file => {
                        if (file.endsWith('.' + type) || file.endsWith('.' + type + '.br') || file.endsWith('.' + type + '.gz')) {
                            let originalFilename = file.split('.');

                            if (file.endsWith('.' + type)) {
                                originalFilename.splice(originalFilename.length - 2, 1);
                            } else {
                                originalFilename.splice(originalFilename.length - 3, 1);
                            }
                            originalFilename = originalFilename.join('.');
                            fs.copyFileSync(path.resolve(__dirname, rootPath, 'releasedAssets/', type, file), path.resolve(__dirname, rootPath, 'releasedAssets/', type, originalFilename));
                        }
                    });
                });
                
                callback();
            }, ['afterEmit']),
            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery'
            }),
            new WebpackBar({
                profile: true
            })
        ];

        if (!devMode) {
            plugins.push(new ImageminWebpackPlugin({
                test: /\.(jpe?g|png|gif|svg)$/i
            }),
            new CompressionWebpackPlugin({
                algorithm: 'gzip'
            }),
            new BrotliWebpackPlugin());
        } else {
            plugins.push(new LiveReloadPlugin());
        }

        if (localesConfig.length) {
            plugins.push(new MergeJsonWebpackPlugin({
                'output': {
                    'groupBy': localesConfig
                },
                'globOptions': {
                    'nosort': true
                }
            }));
        }

        const mainEntryPoints = [rootPath + 'js/all.js'];

        if (fs.existsSync(path.resolve(__dirname, rootPath, 'js/last.js'))) {
            mainEntryPoints.push(path.resolve(__dirname, rootPath, 'js/last.js'));
        }

        const productConfig = {
            mode: devMode ? 'development' : 'production',
            entry: {
                'main.bundle': mainEntryPoints
            },
            output: {
                filename: 'js/[name].[contenthash].js',
                path: path.resolve(__dirname, rootPath, 'releasedAssets')
            },
            devtool: 'cheap-source-map',
            module: {
                rules: [
                {
                        test: /\.(js)$/,
                        exclude: /node_modules\/(?!ui-core).*/,
                        use: {
                            loader: 'babel-loader',
                            options: {
                                'sourceType': 'unambiguous',
                                presets: [
                                    [
                                        '@babel/preset-env',
                                        {
                                            'useBuiltIns': 'entry'
                                        }
                                    ]
                                ],
                                cacheDirectory: true
                            }
                        }
                },
                {
                        test: /\.scss$/,
                        use: [{
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                
                            }
                        }, {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true,
                                url: false
                            }
                        }, {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true,
                                url: false
                            }
                        }]
                    },
                    {
                        test: require.resolve('jquery'),
                        use: [{
                        loader: 'expose-loader',
                        options: 'jQuery'
                        },
                        {
                        loader: 'expose-loader',
                        options: '$'
                        }]
                    }
                ]
            },
            optimization: {
                minimize: !devMode,
                minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})]
            },
            plugins: plugins,
            watch: devMode && watcherEnabled,
            stats: 'verbose'
        };

        // add JS entries (files starting with 'build')
        fs.readdirSync(path.resolve(__dirname, rootPath, 'js')).map(file => {
            if (file.startsWith('build')) {
                productConfig.entry[file.replace('.js', '.' + 'bundle')] = rootPath + 'js/' + file;
            }
        });
        
        // add CSS entries (files starting with 'selected', 'build', 'print', 'sourceJs')
        fs.readdirSync(path.resolve(__dirname, rootPath, 'scss')).map(file => {
            if (file.startsWith('selected') || file.startsWith('build') || file.startsWith('print') || file.startsWith('sourceJs')) {
                productConfig.entry[file.replace('.scss', '')] = rootPath + 'scss/' + file;
            }
        });

        return productConfig;
    };

    configs.push(createConfig('./'));

    // check for sub-products and theme products
    fs.readdirSync(path.resolve(__dirname)).map(fileOrFolder => {
        if (fs.statSync(path.resolve(__dirname, fileOrFolder)).isDirectory() && fileOrFolder !== 'node_modules' && fs.existsSync(path.resolve(__dirname, fileOrFolder, 'widgets')) && fs.existsSync(path.resolve(__dirname, fileOrFolder, 'info.json'))) {
            configs.push(createConfig('./' + fileOrFolder + '/'));
        }
    });

    console.log('###########----------- Running webpack in ' + (devMode ? 'development' : 'production') + ' mode -----------###########');
    
    return configs.filter(cfg => cfg !== null);
}
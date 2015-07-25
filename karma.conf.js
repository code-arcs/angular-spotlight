module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        files: [
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/angular/angular.min.js',
            'node_modules/angular-mocks/angular-mocks.js',
            'vendors/**/*.js',

            'dist/*.css',
            'src/spotlight/*.js',
            'src/spotlight/**/*.js',
            'test/**/*.spec.js'
        ],
        exclude: [],
        preprocessors: {},
        plugins: [
            'karma-jasmine',
            'karma-phantomjs-launcher'
        ],
        reporters: ['progress'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['PhantomJS'],
        singleRun: false
    });
};

(function ()
{
    'use strict';

    angular
        .module('fuse')
        .config(config);

    /** @ngInject */
    function config($compileProvider, $httpProvider, WOOCOMMERCE_API_URL)
    {
        $compileProvider.debugInfoEnabled(true);

        $httpProvider.defaults.headers.ecommon = {};
        $httpProvider.defaults.headers.post = {};
        $httpProvider.defaults.headers.put = {};
        $httpProvider.defaults.headers.patch = {};

        $httpProvider.interceptors.push(function () {
            return {
                'request': function (config) {
                    if (config.url.indexOf(WOOCOMMERCE_API_URL) != -1) {
                        config.headers.Authorization = 'Basic ' + window.localStorage.woocommerce;
                    }
                    return config;
                }
            };
        });
    }

})();
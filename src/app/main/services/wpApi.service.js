(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('wpApi', wpApi);

    /** @ngInject */
    function wpApi($http, $httpParamSerializerJQLike, WORDPRESS_API_URL) {

        var cookie = window.localStorage.cookie || false;

        return api;

        function api(controller) {
            return {
                get: function (url, params, data, config) {
                    return call('get', controller + url, params, data, config);
                },
                post: function (url, params, data, config) {
                    return call('post', controller + url, params, data, config);
                },
                put: function (url, params, data, config) {
                    return call('put', controller + url, params, data, config);
                },
                delete: function (url, params, data, config) {
                    return call('delete', controller + url, params, data, config);
                }
            }
        }

        function call(method, url, params, data, config) {
            config = config || {};

            if (url[url.length - 1] != '/') {
                url = url + '/';
            }

            config.method = method;
            config.url = WORDPRESS_API_URL + url;
            config.params = params || {};
            config.data = data || {};

            if (cookie) {
                if (method == 'get') {
                    config.params.cookie = cookie;
                } else {
                    config.data.cookie = cookie;
                }
            }

            config.data = $httpParamSerializerJQLike(config.data);
            config.headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            };

            return $http(config).then(function (response) {
                delete response.data.status;
                return response.data;
            });
        }
    }

})();
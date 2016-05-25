(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('wpUsers', wpUsers);

    /** @ngInject */
    function wpUsers($http, $httpParamSerializer, $q, WORDPRESS_API_URL) {

        var base_params = {
            'cookie': window.localStorage.cookie,
            'callback': 'JSON_CALLBACK'
        };

        return {
            getUserMeta: getUserMeta,
            updateUserMeta: updateUserMeta,
            updateUserMetas: updateUserMetas
        };

        function getUserMeta(key, user_id, single) {
            var params = {};
            if (key) params.meta_key = key;
            if (user_id) params.user_id = user_id;
            if (single) params.single = single;

            var deferred = $q.defer();
            $http.jsonp(
                    WORDPRESS_API_URL +
                    'user/get_user_meta/?' +
                    getQuery(params))
                .success(function (data) {
                    deferred.resolve(data);
                })
                .error(function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function updateUserMeta(key, value) {
            var deferred = $q.defer();
            $http.jsonp(
                    WORDPRESS_API_URL +
                    'user/update_user_meta/?' +
                    getQuery({meta_key: key, meta_value: value}))
                .success(function (data) {
                    deferred.resolve(data);
                })
                .error(function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function updateUserMetas(meta) {
            var deferred = $q.defer();
            $http.jsonp(
                    WORDPRESS_API_URL +
                    'user/update_user_meta_vars/?' +
                    getQuery(meta))
                .success(function (data) {
                    deferred.resolve(data);
                })
                .error(function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getQuery(params) {
            var query = {};
            angular.extend(query, base_params, params);
            return $httpParamSerializer(query);
        }
    }

})();
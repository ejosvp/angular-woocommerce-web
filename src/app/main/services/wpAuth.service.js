(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('wpAuth', wpAuth);

    /** @ngInject */
    function wpAuth(wpApi) {

        var api = wpApi('deli');

        var service = {
            login: login,
            logout: logout,
            getUser: getUser,
            userCan: userCan
        };

        function login(username, password) {
            service.logout();
            return api.post('/login', {}, {
                username: username,
                password: password
            }).then(function (response) {
                window.localStorage.cookie = response.cookie;
                window.localStorage.woocommerce = response.woocommerce;
                window.localStorage.user = JSON.stringify(response.user);

                return response.user;
            });
        }

        function logout() {
            console.log(window.sessionStorage);
            window.localStorage.clear();
            console.log(window.sessionStorage);
        }

        function getUser() {
            return window.localStorage.user ?
                JSON.parse(window.localStorage.user) :
                false;
        }

        function userCan(roles) {
            var user = service.getUser();

            if (!user) {
                return false;
            }

            if (!Array.isArray(roles)) {
                roles = [roles];
            }

            for (var i in roles) {
                var role = roles[i];
                if (role in user.roles && user.roles[role]) {
                    return true;
                }
            }

            return false;
        }

        return service;
    }

})();
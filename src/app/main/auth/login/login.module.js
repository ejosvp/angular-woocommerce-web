(function () {
    'use strict';

    angular
        .module('auth.login', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {
        // State
        $stateProvider.state('auth_login', {
            url: '/login',
            views: {
                'main@': {
                    templateUrl: 'app/core/layouts/content-only.html',
                    controller: 'MainController as vm'
                },
                'content@auth_login': {
                    templateUrl: 'app/main/auth/login/login.html',
                    controller: 'LoginController as vm'
                }
            },
            bodyClass: 'login'
        });
    }

})();
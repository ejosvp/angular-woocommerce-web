(function () {
    'use strict';

    angular
        .module('auth.logout')
        .controller('LogoutController', LogoutController);

    /** @ngInject */
    function LogoutController($state, wpAuth) {
        wpAuth.logout();
        $state.go('auth_login');
    }
})();
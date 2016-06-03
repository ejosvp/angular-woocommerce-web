(function () {
    'use strict';

    angular
        .module('auth.logout', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {
        // State
        $stateProvider.state('auth_logout', {
            url: '/logout',
            views: {
                'main@': {
                    controller: 'LogoutController as vm'
                }
            }
        });
    }

})();
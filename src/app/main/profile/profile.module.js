(function () {
    'use strict';

    angular
        .module('app.profile', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider) {
        // State
        $stateProvider
            .state('app.profile', {
                role: ['store_admin', 'driver'],
                url: '/profile',
                views: {
                    'content@app': {
                        templateUrl: 'app/main/profile/profile.html',
                        controller: 'ProfileController as vm'
                    }
                },
                resolve: {
                    Store: function (wpDeli) {
                        return wpDeli.getStore();
                    }
                }
            })
        ;
    }
})();
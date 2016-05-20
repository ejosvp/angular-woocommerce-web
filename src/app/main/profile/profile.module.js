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
                role: ['administrator', 'driver'],
                url: '/profile',
                views: {
                    'content@app': {
                        templateUrl: 'app/main/profile/profile.html',
                        controller: 'ProfileController as vm'
                    }
                },
                resolve: {
                    Store: function (wpUsers) {
                        return wpUsers.getUserMeta();
                    }
                }
            })
        ;
    }
})();
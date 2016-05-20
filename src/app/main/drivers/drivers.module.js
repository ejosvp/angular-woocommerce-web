(function () {
    'use strict';

    angular
        .module('app.drivers', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider) {
        // State
        $stateProvider
            .state('app.drivers', {
                url: '/drivers',
                views: {
                    'content@app': {
                        templateUrl: 'app/main/drivers/drivers.html',
                        controller: 'DriversController as vm'
                    }
                },
                resolve: {
                    Drivers: function (apiResolver) {
                        return apiResolver.resolve('users@get', {
                            'filter[role]': 'driver'
                        });
                    }
                },
                role: 'administrator'
            })
        ;

        // Translation
        $translatePartialLoaderProvider.addPart('app/main/drivers');

        // Api
        msApiProvider.register('drivers', ['app/data/drivers/drivers.json']);

        // Navigation
        msNavigationServiceProvider.saveItem('drivers', {
            title: 'Drivers',
            icon: 'motorcycle',
            state: 'app.drivers',
            weight: 4
        });
    }
})();
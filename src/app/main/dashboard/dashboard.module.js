(function ()
{
    'use strict';

    angular
        .module('app.dashboard', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider)
    {
        // State
        $stateProvider
            .state('app.dashboard', {
                url    : '/dashboard',
                role   : 'administrator',
                views  : {
                    'content@app': {
                        templateUrl: 'app/main/dashboard/dashboard.html',
                        controller : 'DashboardController as vm'
                    }
                },
                resolve: {
                    DashboardData: function (msApi)
                    {
                        return msApi.resolve('dashboard@get');
                    }
                }
            })
        ;

        // Translation
        $translatePartialLoaderProvider.addPart('app/main/dashboard');

        // Api
        msApiProvider.register('dashboard', ['app/data/dashboard/dashboard.json']);

        // Navigation
        // msNavigationServiceProvider.saveItem('dashboard', {
        //     title    : 'Dashboard',
        //     icon     : 'icon-tile-four',
        //     state    : 'app.dashboard',
        //     weight   : 1
        // });

        msNavigationServiceProvider.saveItem('help', {
            title    : 'Help/Support',
            icon     : 'email',
            external : 'mailto:info@vexsolutions.com',
            target   : '_blank',
            weight   : 6
        });

        msNavigationServiceProvider.saveItem('logout', {
            title    : 'Logout',
            icon     : 'power_settings_new',
            state    : 'auth_login',
            weight   : 7
        });
    }
})();

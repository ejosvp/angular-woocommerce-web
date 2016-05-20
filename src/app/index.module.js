(function ()
{
    'use strict';

    /**
     * Main module of the Fuse
     */
    angular
        .module('fuse', [

            // Core
            'app.core',

            // Navigation
            'app.navigation',

            // Toolbar
            'app.toolbar',

            // Quick panel
            'app.quick-panel',

            // Auth
            'auth.login',

            // Orders
            'app.orders',
            'app.drivers',
            'app.profile',

            // Dashboard
            'app.dashboard'
        ]);
})();
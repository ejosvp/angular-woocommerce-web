(function ()
{
    'use strict';

    angular
        .module('app.toolbar')
        .controller('ToolbarController', ToolbarController);

    /** @ngInject */
    function ToolbarController($rootScope, $mdSidenav, auth, $state, User)
    {
        var vm = this;

        // Data
        $rootScope.global = {
            search: ''
        };
        
        vm.user = User;
        vm.is_admin = auth.userHasRole('administrator');

        vm.bodyEl = angular.element('body');
        vm.userStatusOptions = [
            {
                'title': 'Ready to Deliver',
                'icon' : 'check_circle',
                'color': '#4CAF50'
            },
            {
                'title': 'Not Available',
                'icon' : 'remove_circle',
                'color': '#F44336'
            }
        ];

        // Methods
        vm.toggleSidenav = toggleSidenav;
        vm.logout = logout;
        vm.setUserStatus = setUserStatus;
        vm.toggleHorizontalMobileMenu = toggleHorizontalMobileMenu;

        //////////

        init();

        /**
         * Initialize
         */
        function init()
        {
            // Select the first status as a default
            vm.userStatus = vm.userStatusOptions[0];
        }


        /**
         * Toggle sidenav
         *
         * @param sidenavId
         */
        function toggleSidenav(sidenavId)
        {
            $mdSidenav(sidenavId).toggle();
        }

        /**
         * Sets User Status
         * @param status
         */
        function setUserStatus(status)
        {
            vm.userStatus = status;
        }

        /**
         * Logout Function
         */
        function logout()
        {
            auth.logout();
            $state.transitionTo('auth_login');
        }

        /**
         * Toggle horizontal mobile menu
         */
        function toggleHorizontalMobileMenu()
        {
            vm.bodyEl.toggleClass('ms-navigation-horizontal-mobile-menu-active');
        }
    }

})();
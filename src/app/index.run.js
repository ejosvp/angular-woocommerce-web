(function () {
    'use strict';

    angular
        .module('fuse')
        .run(runBlock);

    /** @ngInject */
    function runBlock(wpAuth, Location, WebSocket,
                      $rootScope, $timeout, $state) {
        // Activate loading indicator
        var stateChangeStartEvent = $rootScope.$on('$stateChangeStart', function () {
            $rootScope.loadingProgress = true;
        });

        // De-activate loading indicator
        var stateChangeSuccessEvent = $rootScope.$on('$stateChangeSuccess', function () {
            $timeout(function () {
                $rootScope.loadingProgress = false;
            });
        });

        // Store state in the root scope for easy access
        $rootScope.state = $state;

        // auth
        $rootScope.$on('$stateChangeStart', function (event, toState) {
            if (toState.role) {
                if (!wpAuth.userCan(toState.role)) {
                    event.preventDefault();
                    $state.go('auth_login');
                }
            }
        });

        // websockets init
        WebSocket.init();

        // emit driver position
        if (wpAuth.userCan('driver')) {
            Location.emitPosition();
        }

        // Cleanup
        $rootScope.$on('$destroy', function () {
            stateChangeStartEvent();
            stateChangeSuccessEvent();
        });
    }
})();
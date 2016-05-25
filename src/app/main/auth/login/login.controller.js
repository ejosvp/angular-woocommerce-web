(function () {
    'use strict';

    angular
        .module('auth.login')
        .controller('LoginController', LoginController);

    /** @ngInject */
    function LoginController($state, wpAuth, wpDeli) {
        var vm = this;

        // Data
        vm.user = {
            username: null,
            password: null
        };

        // Methods
        vm.login = login;

        //////////
        function login() {

            var user = {
                username: vm.user.username,
                password: vm.user.password
            };

            wpAuth.login(user.username, user.password)
                .then(function (user) {
                    if (wpAuth.userCan('store_admin')) {
                        wpDeli.store().then(function (store) {
                            if (store.new) {
                                $state.go('app.profile');
                            }
                        })
                    }
                    $state.go('app.orders.list');
                });
        }
    }
})();
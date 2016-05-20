(function () {
    'use strict';

    angular
        .module('auth.login')
        .controller('LoginController', LoginController);

    /** @ngInject */
    function LoginController($state, auth) {
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

            auth.login(user)
                .then(function (user) {
                    //success
                    $state.go('app.orders.list');
                }, function (err) {
                    //error
                    console.log(err);
                    // $scope.error = err;
                });
        }
    }
})();
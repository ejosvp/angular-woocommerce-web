(function () {
    'use strict';

    angular
        .module('app.orders')
        .controller('OrdersController', OrdersController);

    /** @ngInject */
    function OrdersController(Orders, auth) {
        var vm = this;

        // Data
        vm.is_admin = auth.userHasRole(auth.USER_ROLE.ADMIN);
        vm.is_driver = auth.userHasRole(auth.USER_ROLE.DRIVER);
        vm.orders = Orders;

        // Methods

        //////////
    }
})();
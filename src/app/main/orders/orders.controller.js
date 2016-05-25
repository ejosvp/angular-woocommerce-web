(function () {
    'use strict';

    angular
        .module('app.orders')
        .controller('OrdersController', OrdersController);

    /** @ngInject */
    function OrdersController(Orders, wpAuth) {
        var vm = this;

        // Data
        vm.is_admin = wpAuth.userCan('store_admin');
        vm.is_driver = wpAuth.userCan('driver');
        vm.orders = Orders;

        // Methods

        //////////
    }
})();
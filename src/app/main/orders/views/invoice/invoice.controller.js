(function () {
    'use strict';

    angular
        .module('app.orders')
        .controller('OrderInvoiceController', OrderInvoiceController);

    /** @ngInject */
    function OrderInvoiceController(Order, StoreInfo, User, // Data
                             googleMaps, Location, auth, DialogService, // App services
                             $state, $q // Core services
    ) {
        var vm = this;

        // Data
        vm.order = Order;
    }
})();

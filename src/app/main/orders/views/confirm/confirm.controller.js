(function () {
    'use strict';

    angular
        .module('app.orders')
        .controller('OrderConfirmController', OrderConfirmController);

    /** @ngInject */
    function OrderConfirmController(Order, User, Drivers, // Data
                                    googleMaps, wpDeli, DialogService, // App services
                                    $state, $q, $timeout // Core services
    ) {
        var vm = this;

        // Data
        vm.order = Order;
        vm.order.coords = {latitude: 0, longitude: 0};
        vm.order.markerOptions = {icon: googleMaps.getIcon('client.png', [30, 30])};

        vm.order.selectable_items = true;
        if (vm.order.store_accepted_at) {
            storeAcceptedAt();
        }

        vm.user = User;

        vm.drivers = Drivers;
        vm.driver = vm.drivers[0];

        vm.map = googleMaps.Map();

        vm.dialog = DialogService;
        // Methods
        vm.declineOrder = declineOrder;
        vm.setDriver = setDriver;
        vm.storeAccept = storeAccept;

        //////////
        function declineOrder() {
            $state.go('app.orders.list')
        }

        function setDriver(driver) {
            vm.driver = driver;
        }

        function storeAccept() {
            wpDeli.storeAccept(vm.order.id, vm.driver.id).then(function (accepted_at) {
                storeAcceptedAt();
            });
        }

        function storeAcceptedAt() {
            vm.store_accepted_at = Math.floor((moment().unix() - vm.order.store_accepted_at) / 60);
            $timeout(storeAcceptedAt, 1000);
        }

        $q.all([
            _getUserCoords(),
            _getOrderCoords()
        ]).then(_calculateDistances);

        function _getUserCoords() {
            var deferred = $q.defer();

            wpDeli.getStore(vm.user.id).then(function (store) {
                vm.map.center = angular.copy(store.coords);
                vm.map.extendBounds(store.coords);

                vm.user.coords = store.coords;
                vm.user.markerOptions = {icon: googleMaps.getIcon('store.png', [35, 35])};

                deferred.resolve({
                    lat: store.coords.latitude,
                    lng: store.coords.longitude
                });
            });

            return deferred.promise;
        }

        function _getOrderCoords() {
            var deferred = $q.defer();
            googleMaps.geocodeAddress(vm.order.shipping_address.full_address).then(function (coords) {
                vm.order.coords = coords;
                vm.map.extendBounds(coords);

                deferred.resolve({
                    lat: coords.latitude,
                    lng: coords.longitude
                });
            });
            return deferred.promise;
        }

        function _calculateDistances(results) {
            googleMaps.getDistances([results[0]], [results[1]]).then(function (list) {
                vm.order.distances = list[0];
            });
        }
    }
})();

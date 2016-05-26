(function () {
    'use strict';

    angular
        .module('app.orders')
        .controller('OrderController', OrderController);

    /** @ngInject */
    function OrderController(Order, User, // Data
                             googleMaps, Location, wpAuth, wpDeli, DialogService, // App services
                             $state, $q // Core services
    ) {
        var vm = this;

        // Data
        vm.order = Order;
        vm.order.coords = {latitude: 0, longitude: 0};
        vm.order.markerOptions = {icon: googleMaps.getIcon('client.png', [30, 30])};

        vm.user = User;

        vm.map = googleMaps.Map();

        vm.dialog = DialogService;
        // Methods
        vm.declineOrder = declineOrder;

        //////////
        function declineOrder() {
            $state.go('app.orders.list')
        }

        $q.all([
            _getUserCoords(),
            _getOrderCoords()
        ]).then(_calculateDistances);

        function _getUserCoords() {
            var deferred = $q.defer();

            if (wpAuth.userCan('store_admin')) {
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
            }
            else if (wpAuth.userCan('driver')) {
                Location.getCurrentPosition().then(function (coords) {
                    vm.map.center = angular.copy(coords);
                    vm.map.extendBounds(coords);

                    vm.user.coords = coords;
                    vm.user.markerOptions = {icon: googleMaps.getIcon('truck.png')};

                    deferred.resolve({
                        lat: coords.latitude,
                        lng: coords.longitude
                    });
                });
            }

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

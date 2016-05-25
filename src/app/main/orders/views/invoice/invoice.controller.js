(function () {
    'use strict';

    angular
        .module('app.orders')
        .controller('OrderInvoiceController', OrderInvoiceController);

    /** @ngInject */
    function OrderInvoiceController(Order, StoreInfo, User, // Data
                                    googleMaps, Location, wpAuth, DialogService, // App services
                                    $state, $q // Core services
    ) {
        var vm = this;

        // Data
        vm.order = Order;
        vm.order.coords = {latitude: 0, longitude: 0};
        vm.order.markerOptions = {icon: googleMaps.getIcon('client.png', [30, 30])};

        vm.order.selectable_items = true;

        vm.store = StoreInfo;

        vm.user = User;
        vm.i_am_here = false;
        vm.accepted = false;

        vm.map = googleMaps.Map();

        vm.dialog = DialogService;
        // Methods
        vm.iAmHere = iAmHere;
        vm.acceptDelivery = acceptDelivery;
        vm.completeOrder = completeOrder;

        //////////
        function iAmHere() {
            vm.i_am_here = true;
        }

        function acceptDelivery() {
            vm.order.order_meta = {
                accepted_at: moment()
            };
            vm.order.$save().then(function () {
                vm.accepted = true;
            });
        }

        function completeOrder() {
            vm.order.status = 'complete';
            vm.order.order_meta = {
                completed_at: moment()
            };
            vm.order.$save().then(function () {
                $state.go('app.orders.list');
            });
        }

        $q.all([
            _getUserCoords(),
            _getOrderCoords()
        ]).then(_calculateDistances);

        function _getUserCoords() {
            var deferred = $q.defer();

            if (wpAuth.userCan('store_admin')) {
                googleMaps.geocodeAddress(vm.store.storeAddress).then(function (coords) {
                    vm.map.center = angular.copy(coords);
                    vm.map.extendBounds(coords);

                    vm.user.coords = coords;
                    vm.user.markerOptions = {icon: googleMaps.getIcon('store.png', [35, 35])};

                    deferred.resolve({
                        lat: coords.latitude,
                        lng: coords.longitude
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
            else {
                deferred.reject()
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

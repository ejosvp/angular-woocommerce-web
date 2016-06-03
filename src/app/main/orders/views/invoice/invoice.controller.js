(function () {
    'use strict';

    angular
        .module('app.orders')
        .controller('OrderInvoiceController', OrderInvoiceController);

    /** @ngInject */
    function OrderInvoiceController(Order, User, // Data
                                    googleMaps, Location, wpDeli, DialogService, // App services
                                    $q, $timeout // Core services
    ) {
        var vm = this;

        // Data
        vm.order = Order;
        console.log(vm.order);
        vm.order.coords = {latitude: 0, longitude: 0};
        vm.order.markerOptions = {icon: googleMaps.getIcon('client.png', [30, 30])};

        vm.order.selectable_items = true;
        if (vm.order.deli.rank_driver_time) {
            driverAcceptedAt();
        }
        vm.client_vote = null;

        vm.user = User;
        vm.i_am_here = false;
        vm.accepted = false;

        vm.map = googleMaps.Map();

        vm.dialog = DialogService;
        // Methods
        vm.iAmHere = iAmHere;
        vm.driverAccept = driverAccept;
        vm.clientAccept = clientAccept;

        //////////
        function iAmHere() {
            vm.i_am_here = true;
        }

        function driverAccept() {
            wpDeli.driverAccept(vm.order.id).then(function (accepted_at) {

                driverAcceptedAt();
            });
        }

        function driverAcceptedAt() {
            vm.driver_accepted_at = Math.floor((moment().unix() - vm.order.driver_accepted_at) / 60);
            $timeout(driverAcceptedAt, 1000);
        }

        function clientAccept() {
            wpDeli.clientAccept(vm.order.id, vm.client_vote).then(function (accepted_at) {
            });
        }

        $q.all([
            _getUserCoords(),
            _getOrderCoords()
        ]).then(_calculateDistances);

        function _getUserCoords() {
            var deferred = $q.defer();
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

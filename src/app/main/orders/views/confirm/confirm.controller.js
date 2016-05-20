(function () {
    'use strict';

    angular
        .module('app.orders')
        .controller('OrderConfirmController', OrderConfirmController);

    /** @ngInject */
    function OrderConfirmController(Order, StoreInfo, User, Drivers,// Data
                             googleMaps, Location, auth, DialogService, // App services
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

        vm.drivers = Drivers.customers;
        vm.driver = vm.drivers[0];

        vm.map = googleMaps.Map();

        vm.dialog = DialogService;
        // Methods
        vm.declineOrder = declineOrder;
        vm.setDriver = setDriver;
        vm.sendProducts = sendProducts;
        vm.zeros = zeros;

        //////////
        function declineOrder() {
            $state.go('app.orders.list')
        }

        function setDriver(driver) {
            vm.driver = driver;
        }

        function sendProducts() {
            vm.order.status = 'pending';
            vm.order.order_meta = {
                driver: vm.driver.id,
                confirmed_at: moment()
            };
            vm.order.$save().then(function () {
                vm.accepted = true;
                start();
            });
        }

        function start() {
            vm.time++;
            vm.timeout = $timeout(start, 1000);
        }

        function zeros(min) {
            if (min < 10)
                return '0' + Math.floor(min);
            return Math.floor(min) + '';
        }

        $q.all([
            _getUserCoords(),
            _getOrderCoords()
        ]).then(_calculateDistances);

        function _getUserCoords() {
            var deferred = $q.defer();

            if (auth.userHasRole(auth.USER_ROLE.ADMIN)) {
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
            else if (auth.userHasRole(auth.USER_ROLE.DRIVER)) {
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

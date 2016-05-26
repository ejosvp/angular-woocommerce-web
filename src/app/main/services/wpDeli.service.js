(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('wpDeli', wpDeli);

    /** @ngInject */
    function wpDeli(wpApi, wpAuth, googleMaps, WebSocket, $q) {

        var api = wpApi('deli');

        var service = {
            storeAccept: storeAccept,
            driverAccept: driverAccept,
            clientAccept: clientAccept,
            getOrders: getOrders,
            getOrder: getOrder,
            getStore: getStore,
            updateStore: updateStore,
            getDrivers: getDrivers,
            getDriver: getDriver,
            updateDriver: updateDriver
        };

        // Methods
        function storeAccept(order_id, driver_id) {
            return api.post('/store_accept', {}, {
                order_id: order_id,
                driver_id: driver_id
            });
        }

        function driverAccept(order_id) {
            return api.post('/driver_accept', {}, {
                order_id: order_id
            });
        }

        function clientAccept(order_id, client_vote) {
            return api.post('/client_accept', {}, {
                order_id: order_id,
                client_vote: client_vote
            });
        }

        function getOrders() {
            return api.get('/orders').then(filterOrders);
        }

        function getOrder(id) {
            return api.get('/orders', {
                id: id
            });
        }

        function getStore() {
            return api.get('/store');
        }

        function updateStore(store) {
            return api.post('/store', {}, store);
        }

        function getDrivers() {
            return api.get('/drivers');
        }

        function getDriver() {
            return api.get('/driver');
        }

        function updateDriver(store) {
            return api.post('/driver', {}, store);
        }

        ////////////
        function filterOrders(results) {
            var deferred = $q.defer();
            var _orders = {};

            var promises = [];
            var promise = $q.defer();
            promises.push(promise);
            if (wpAuth.userCan('store_admin')) {
                service.getStore().then(function (store) {
                    angular.forEach(results, function (order) {
                        googleMaps.geocodeAddress(order.shipping_address.full_address).then(function (coords) {
                            if (_orderInRadius(coords, store)) {
                                _orders[order.id] = order;
                            }
                            promise.resolve();
                        });
                    });
                    WebSocket.subscribe('new_order', function (id) {
                        service.getOrder(id).then(function (order) {
                            googleMaps.geocodeAddress(order.shipping_address.full_address).then(function (coords) {
                                if (_orderInRadius(coords, store)) {
                                    _orders[order.id] = order;
                                }
                            });
                        });
                    });
                });
            }

            // only resolve when all orders has been processed
            $q.all(promises).then(function () {
                deferred.resolve(_orders)
            });

            function _orderInRadius(coords, store) {
                var distance = google.maps.geometry.spherical.computeDistanceBetween(
                    new google.maps.LatLng(store.coords.latitude, store.coords.longitude),
                    new google.maps.LatLng(coords.latitude, coords.longitude));
                return distance < store.radius;
            }

            return deferred.promise;
        }

        return service;
    }

})();
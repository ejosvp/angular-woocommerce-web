(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('OrderService', OrderService);

    /** @ngInject */
    function OrderService(wpDeli, wpAuth, WebSocket, googleMaps, // App services
                          $q, apiResolver // Core services
    ) {
        var service = {
            getOrders: getOrders,
            getOrder: getOrder
        };

        function getOrders() {
            var deferred = $q.defer();

            function onSuccess(results) {
                var orders = {};

                angular.forEach(results, function (order) {
                    _cleanOrder(order);
                });

                var promises = [];
                var promise = $q.defer();
                promises.push(promise);
                if (wpAuth.userCan('store_admin')) {
                    wpDeli.getStore().then(function (store) {
                        googleMaps.geocodeAddress(store.address).then(function (center) {
                            angular.forEach(results, function (order) {
                                googleMaps.geocodeAddress(order.shipping_address.full_address).then(function (coords) {
                                    order.distance = google.maps.geometry.spherical.computeDistanceBetween(
                                        new google.maps.LatLng(center.latitude, center.longitude),
                                        new google.maps.LatLng(coords.latitude, coords.longitude)
                                    );

                                    if (order.distance < store.radius) {
                                        orders[order.id] = order;
                                    }

                                    promise.resolve();
                                });
                            });
                        });
                    });
                }

                // only resolve when all orders has been processed
                $q.all(promises).then(function () {
                    deferred.resolve(orders)
                });

                // subscribe to new orders
                WebSocket.subscribe('new_order', function (order_id) {
                    service.getOrder(order_id).then(function (order) {
                        _cleanOrder(order);
                        _isValid(order).then(function (is_valid) {
                            if (is_valid) {
                                orders[order.id] = order;
                            }
                        });
                    });
                });
            }

            // get current orders
            wpDeli.getOrders().then(onSuccess);

            return deferred.promise;
        }

        function getOrder(id) {
            var deferred = $q.defer();

            function onSuccess(response) {
                _cleanOrder(response.order);

                deferred.resolve(response.order);
            }

            apiResolver.resolve('orders@get', {
                'id': id
            }).then(onSuccess);

            return deferred.promise;
        }

        function _isValid(order) {
            var deferred = $q.defer();


            return deferred.promise;
        }

        function _cleanOrder(order) {
            if (order.cleaned) {
                return;
            }
            order.cleaned = true;

            // ngResource save
            order.$save = function () {
                return apiResolver.resolve('orders@update', {order: order});
            };

            // dates
            var completed_at = moment(order.completed_at);
            var now = moment();
            order.completed_ago =
                Math.floor(now.diff(completed_at, 'minutes') / 60) + ':' +
                Math.floor(now.diff(completed_at, 'minutes') % 60);
        }

        return service;
    }

})();
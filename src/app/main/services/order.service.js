(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('OrderService', OrderService);

    /** @ngInject */
    function OrderService(wpAuth, USER_ROLE, WebSocket, googleMaps, wpUsers, // App services
                          $q, apiResolver // Core services
    ) {

        var service = {
            getOrders: getOrders,
            getOrder: getOrder
        };

        function getOrders() {
            var deferred = $q.defer();

            function onSuccess(response) {
                var orders = {};

                // remove orders out of radius
                var promises = [];
                angular.forEach(response.orders, function (order) {
                    orders[order.id] = order;

                    _cleanOrder(order);
                    var promise = _isValid(order).then(function (is_valid) {
                        if (!is_valid) {
                            delete orders[order.id];
                        }
                    });
                    promises.push(promise);
                });

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
            apiResolver.resolve('orders@get', {
                'status': wpAuth.userCan('store_admin') ? 'processing' : 'pending'
            }).then(onSuccess);

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

            if (!order.cleaned) {
                deferred.reject();
            }

            else if (wpAuth.userCan('store_admin')) {

                // get Store
                wpUsers.getUserMeta().then(function (store) {

                    // geocode Store address
                    googleMaps.geocodeAddress(store.storeAddress).then(function (center) {

                        // geocode Order address
                        googleMaps.geocodeAddress(order.shipping_address.full_address).then(function (coords) {
                            // calculate distance between order and store
                            order.distance = google.maps.geometry.spherical.computeDistanceBetween(
                                new google.maps.LatLng(center.latitude, center.longitude),
                                new google.maps.LatLng(coords.latitude, coords.longitude)
                            );

                            deferred.resolve(order.distance < store.storeRadius);
                        });
                    });
                });
            }

            else if (wpAuth.userCan(USER_ROLE.DRIVER)) {
                deferred.resolve(wpAuth.getUser().id == order.order_meta.driver)
            }

            else {
                deferred.reject();
            }

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

            // address shortcuts
            order.shipping_address.short_address =
                order.shipping_address.address_1 + ' ' +
                order.shipping_address.address_2;
            order.shipping_address.extra_address =
                order.shipping_address.city + ' ' +
                order.shipping_address.state + ' ' +
                order.shipping_address.postcode + ' ' +
                order.shipping_address.country;
            order.shipping_address.full_address =
                order.shipping_address.short_address + ' ' +
                order.shipping_address.extra_address;

            // dates
            var completed_at = moment(order.completed_at);
            var now = moment();
            order.completed_ago =
                Math.floor(now.diff(completed_at, 'minutes') / 60) + ':' +
                Math.floor(now.diff(completed_at, 'minutes') % 60);

            // clear meta data
            order.order_meta.driver = parseInt(order.order_meta.driver);

            // set methods
        }

        return service;
    }

})();
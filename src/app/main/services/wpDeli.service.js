(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('wpDeli', wpDeli);

    /** @ngInject */
    function wpDeli(wpApi) {

        var api = wpApi('deli');

        var service = {
            storeAccept: storeAccept,
            driverAccept: driverAccept,
            clientAccept: clientAccept,
            getOrders: getOrders,
            getStore: getStore,
            updateStore: updateStore
        };

        function storeAccept(order_id, driver_id) {
            return api('/store_accept', {
                order_id: order_id,
                driver_id: driver_id
            });
        }

        function driverAccept(order_id) {
            return api('/driver_accept', {
                order_id: order_id
            });
        }

        function clientAccept(order_id, client_vote) {
            return api('/client_accept', {
                order_id: order_id,
                client_vote: client_vote
            });
        }

        function getOrders() {
            return api.get('/orders');
        }

        function getStore() {
            return api.get('/store');
        }
        
        function updateStore(store) {
            return api.post('/store', {}, store);
        }

        return service;
    }

})();
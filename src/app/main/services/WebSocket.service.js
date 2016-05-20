(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('WebSocket', WebSocket);

    /** @ngInject */
    function WebSocket($websocket, WEBSOCKETS_URL) {

        var service = {
            subscribers: {},
            init: init,
            subscribe: subscribe
        };

        function init() {
            var dataStream = $websocket(WEBSOCKETS_URL);

            dataStream.onOpen(function (data) {
                console.log(data);
            });

            dataStream.onError(function (error) {
                console.log(error);
            });

            dataStream.onMessage(function (data) {
                console.log(data);
                data = data.data.split(':');
                var channel = data[0];
                var message = data[1];

                if (!channel || !message) {
                    return false;
                }

                if (service.subscribers[channel]) {
                    angular.forEach(service.subscribers[channel], function (callback) {
                        callback(message);
                    });
                }
            });
        }

        function subscribe(channel, callback) {
            if (!service.subscribers[channel]) {
                service.subscribers[channel] = [];
            }
            service.subscribers[channel].push(callback);
        }

        return service;
    }

})();
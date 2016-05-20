(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('Location', Location);

    /** @ngInject */
    function Location(wpUsers, $q, $interval) {

        return {
            getCurrentPosition: getCurrentPosition,
            updatePosition: updatePosition,
            emitPosition: emitPosition
        };

        function emitPosition(seconds) {
            seconds = seconds || 15;

            $interval(updatePosition, seconds * 1000);
        }

        function updatePosition() {
            getCurrentPosition().then(function (coords) {
                wpUsers.updateUserMeta('driverPosition',
                    coords.latitude + ',' +
                    coords.longitude + ',' +
                    moment()
                );
            });
        }

        function getCurrentPosition() {
            var deferred = $q.defer();

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    deferred.resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                }, function (error) {
                    deferred.reject(error);
                });
            } else { // not supported
                deferred.reject(new Error('geolocation is not supported.'));
            }

            return deferred.promise;
        }
    }

})();
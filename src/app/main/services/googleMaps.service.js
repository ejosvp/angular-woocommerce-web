(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('googleMaps', googleMaps);

    /** @ngInject */
    function googleMaps($q, uiGmapGoogleMapApi, uiGmapIsReady) {

        var service = {
            ready: ready,
            geocodeAddress: geocodeAddress,
            getIcon: getIcon,
            showPanorama: showPanorama,
            getDistances: getDistances,
            Map: Map
        };

        function ready() {
            var deferred = $q.defer();
            uiGmapGoogleMapApi.then(function (maps) {
                uiGmapIsReady.promise(1).then(function (instances) {
                    var google = {};
                    google.map = instances[0].map;

                    google.distanceMatrixService = new maps.DistanceMatrixService;

                    google.directionsService = new maps.DirectionsService;
                    google.directionsDisplay = new maps.DirectionsRenderer;
                    google.directionsDisplay.setMap(google.map);
                    google.directionsDisplay.setOptions({
                        suppressMarkers: true
                    });

                    google.panorama = google.map.getStreetView();
                    google.streetViewService = new maps.StreetViewService;

                    google.maps = maps;

                    deferred.resolve(google);
                });
            });
            return deferred.promise;
        }

        function showPanorama(coords) {
            this.ready().then(function (g) {
                var markPosition = new g.maps.LatLng(coords.latitude, coords.longitude);
                g.panorama.setPosition(markPosition);
                g.streetViewService.getPanoramaByLocation(g.panorama.getPosition(), 50, function (data, status) {
                    if (status === g.maps.StreetViewStatus.OK) {
                        var pov = g.panorama.getPov();
                        pov.heading = g.maps.geometry.spherical.computeHeading(
                            data.location.latLng,
                            markPosition
                        );
                        g.panorama.setPov(pov);
                        g.panorama.setVisible(true);
                    } else {
                        console.error('Street View data not found for this location.');
                    }
                });
            });
        }

        function geocodeAddress(address) {
            var deferred = $q.defer();

            uiGmapGoogleMapApi.then(function (maps) {
                var geocoder = new maps.Geocoder();
                geocoder.geocode({'address': address}, function (results, status) {
                    if (status === maps.GeocoderStatus.OK) {
                        deferred.resolve({
                            latitude: results[0].geometry.location.lat(),
                            longitude: results[0].geometry.location.lng()
                        });
                    } else {
                        deferred.reject(status);
                    }
                });
            });

            return deferred.promise;
        }

        function getDistances(origins, destinations) {
            var drivingDeferred = $q.defer();
            var bicyclingDeferred = $q.defer();
            var transitDeferred = $q.defer();
            var walkingDeferred = $q.defer();

            this.ready().then(function (g) {
                // calculate for DRIVING
                g.distanceMatrixService.getDistanceMatrix({
                    origins: origins,
                    destinations: destinations,
                    travelMode: g.maps.TravelMode.DRIVING
                }, function (response, status) {
                    saveDistanceResult(response, status, 'driving', drivingDeferred);
                });

                // calculate for BICYCLING
                g.distanceMatrixService.getDistanceMatrix({
                    origins: origins,
                    destinations: destinations,
                    travelMode: g.maps.TravelMode.BICYCLING
                }, function (response, status) {
                    saveDistanceResult(response, status, 'bicycling', bicyclingDeferred);
                });

                // calculate for TRANSIT
                g.distanceMatrixService.getDistanceMatrix({
                    origins: origins,
                    destinations: destinations,
                    travelMode: g.maps.TravelMode.TRANSIT
                }, function (response, status) {
                    saveDistanceResult(response, status, 'transit', transitDeferred);
                });

                // calculate for WALKING
                g.distanceMatrixService.getDistanceMatrix({
                    origins: origins,
                    destinations: destinations,
                    travelMode: g.maps.TravelMode.WALKING
                }, function (response, status) {
                    saveDistanceResult(response, status, 'walking', walkingDeferred);
                });

                function saveDistanceResult(response, status, travelMode, localDeferred) {
                    if (status === g.maps.DistanceMatrixStatus.OK) {
                        var results = [];
                        angular.forEach(response.rows[0].elements, function (result, index) {
                            results[index] = {
                                travelMode: travelMode,
                                distance: result.distance.text,
                                duration: result.duration.text
                            };
                        });
                        localDeferred.resolve(results);
                    } else {
                        localDeferred.resolve(false);
                    }
                }
            });

            var deferred = $q.defer();
            $q.all([
                drivingDeferred.promise,
                bicyclingDeferred.promise,
                transitDeferred.promise,
                walkingDeferred.promise
            ]).then(function (results) {
                var distances = [];
                angular.forEach(results, function (list) {
                    if (list) {
                        angular.forEach(list, function (item, index) {
                            if (!distances[index]) {
                                distances[index] = [];
                            }
                            distances[index].push(item);
                        });
                    }
                });
                deferred.resolve(distances);
            });
            return deferred.promise;
        }

        function getIcon(icon, size) {
            var iconData = {
                origin: {x: 0, y: 0},
                url: 'assets/images/maps/' + icon
            };
            if (size) {
                iconData.scaledSize = {
                    width: size[0],
                    height: size[1]
                };
            }
            return iconData;
        }

        function Map(map) {
            // init
            map = map || {
                    center: {latitude: 0, longitude: 0},
                    zoom: 14,
                    bounds: {
                        northeast: {latitude: 0, longitude: 0},
                        southwest: {latitude: 0, longitude: 0}
                    },
                    extendBounds: extendBounds
                };

            // methods
            function extendBounds(coords) {
                uiGmapGoogleMapApi.then(function (maps) {
                    map._LatLngBounds = map._LatLngBounds || new maps.LatLngBounds();
                    map._LatLngBounds.extend(new maps.LatLng(coords.latitude, coords.longitude));
                    map.bounds = {
                        northeast: {
                            latitude: map._LatLngBounds.getNorthEast().lat(),
                            longitude: map._LatLngBounds.getNorthEast().lng()
                        },
                        southwest: {
                            latitude: map._LatLngBounds.getSouthWest().lat(),
                            longitude: map._LatLngBounds.getSouthWest().lng()
                        }
                    };
                });
            }

            return map;
        }

        return service;
    }

})();
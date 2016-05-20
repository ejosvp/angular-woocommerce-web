(function () {
    'use strict';

    angular
        .module('app.orders')
        .controller('InvoiceOrderController', InvoiceOrderController);

    /** @ngInject */
    function InvoiceOrderController(Order, api, DriversData,
                                    $timeout, $document, $mdDialog,
                                    uiGmapGoogleMapApi, googleMapsUtils, uiGmapIsReady) {
        var vm = this;

        // Data
        vm.order = Order.order;
        if (vm.order.order_meta.accepted_at) {

        }

        vm.accepted = false;
        vm.i_am_here = false;
        vm.time = 0;
        vm.drivers = DriversData.data.drivers;
        vm.driver = vm.drivers[0];

        // Methods
        vm.acceptDelivery = acceptDelivery;
        vm.start = start;
        vm.stop = stop;
        vm.zeros = zeros;
        vm.setDriver = setDriver;
        vm.iAmHere = iAmHere;
        vm.completeOrder = completeOrder;
        vm.getFullAddress = getFullAddress;

        //////////
        function getFullAddress(order) {
            return order.shipping_address.address_1 + ' ' +
                order.shipping_address.address_2 + ' ' +
                order.shipping_address.city + ' ' +
                order.shipping_address.state + ' ' +
                order.shipping_address.postcode + ' ' +
                order.shipping_address.country;
        }

        function completeDialog(ev) {
            $mdDialog.show({
                controller: 'CompleteDialogController',
                controllerAs: 'vm',
                templateUrl: 'app/main/orders/dialogs/complete/complete-dialog.html',
                parent: angular.element($document.body),
                targetEvent: ev
            });
        }

        function setDriver(driver) {
            vm.driver = driver;
        }

        function iAmHere() {
            vm.i_am_here = true;
        }

        function acceptDelivery() {
            vm.order.order_meta = {
                accepted_at: moment()
            };
            api.orders.update({order: vm.order},
                function () {
                    vm.accepted = true;
                    vm.start()
                },
                function (res) {
                    console.log(res);
                }
            );
        }

        function completeOrder() {
            vm.order.status = 'complete';
            api.orders.update({order: vm.order},
                function () {
                    completeDialog(vm);
                },
                function (res) {
                    console.log(res);
                }
            );
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

        function stop() {
            $timeout.cancel(vm.timeout);
        }

        uiGmapGoogleMapApi.then(function (maps) {
            // bootstrap map
            vm.markerMap = {
                center: {latitude: 0, longitude: 0},
                zoom: 15,
                markers: []
            };

            // set current position
            googleMapsUtils.getCurrentPosition().then(function (location) {
                vm.markerMap.markers.push({
                    id: 0,
                    coords: location.coords,
                    options: {
                        icon: googleMapsUtils.getIcon('truck.png', maps)
                    }
                });
            });

            // geocode order addresses
            googleMapsUtils.geocodeAddress(getFullAddress(vm.order)).then(function (location) {
                vm.markerMap.markers.push({
                    id: vm.order.id,
                    coords: location,
                    options: {}
                });
            });
        });
    }
})();

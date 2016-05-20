(function () {
    'use strict';

    angular
        .module('app.profile')
        .controller('ProfileController', ProfileController);

    /** @ngInject */
    function ProfileController(Store, // Data
                               wpUsers, DialogService, googleMaps, // App services
                               $q // Core services
    ) {
        var vm = this;

        // Data
        vm.store = Store;
        setRadius();

        vm.map = googleMaps.Map();
        vm.map.circleEvents = {
            radius_changed: radiusChanged
        };

        // Methods
        vm.saveForm = saveForm;
        vm.setRadius = setRadius;

        //////////
        function saveForm(ev) {
            wpUsers.updateUserMetas({
                storeName: vm.store.storeName,
                storeDescription: vm.store.storeDescription,
                storeAddress: vm.store.storeAddress,
                storeRadius: vm.store.storeRadius,
                storePhone: vm.store.storePhone
            }).then(function () {
                DialogService.showAlert(ev, 'Store Info updated!');
            });
        }

        function setRadius() {
            vm.store.radius = parseInt(vm.store.storeRadius);
        }

        function radiusChanged(circle) {
            circle.getMap().fitBounds(circle.getBounds());
        }

        googleMaps.geocodeAddress(vm.store.storeAddress).then(function (coords) {
            vm.map.center = angular.copy(coords);

            vm.store.coords = coords;
            vm.store.markerOptions = {icon: googleMaps.getIcon('store.png', [35, 35])};
        });
    }
})();

(function () {
    'use strict';

    angular
        .module('app.profile')
        .controller('ProfileController', ProfileController);

    /** @ngInject */
    function ProfileController(Store, // Data
                               wpDeli, DialogService, googleMaps, // App services
                               $q // Core services
    ) {
        var vm = this;

        // Data
        vm.store = Store;

        vm.map = googleMaps.Map();
        vm.map.markerOptions = {icon: googleMaps.getIcon('store.png', [35, 35])};
        vm.map.center = angular.copy(vm.store.coords);
        vm.map.circleEvents = {
            radius_changed: radiusChanged
        };

        // Methods
        vm.saveForm = saveForm;
        vm.geocodeAddress = geocodeAddress;

        //////////
        function saveForm(ev) {
            wpDeli.updateStore(vm.store).then(function (store) {
                vm.store = store;
                DialogService.showAlert(ev, 'Store Info updated!');
            });
        }

        function radiusChanged(circle) {
            circle.getMap().fitBounds(circle.getBounds());
        }

        function geocodeAddress() {
            googleMaps.geocodeAddress(vm.store.address).then(function (coords) {
                vm.map.center = angular.copy(coords);
                vm.store.coords = coords;
            });
        }
    }
})();

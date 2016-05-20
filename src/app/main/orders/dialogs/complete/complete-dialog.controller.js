(function () {
    'use strict';

    angular
        .module('app.orders')
        .controller('CompleteDialogController', CompleteDialogController);

    /** @ngInject */
    function CompleteDialogController($mdDialog, $state) {
        var vm = this;

        // Methods
        vm.closeDialog = closeDialog;

        //////////

        function closeDialog() {
            $mdDialog.hide();
            $state.go('app.orders.list');
        }
    }
})();

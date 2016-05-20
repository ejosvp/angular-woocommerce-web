(function () {
    'use strict';

    angular
        .module('app.orders')
        .controller('AcceptDialogController', AcceptDialogController);

    /** @ngInject */
    function AcceptDialogController($mdDialog, order, details, totals) {
        var vm = this;

        // Methods
        vm.closeDialog = closeDialog;
        vm.order = order;
        vm.details = details;
        vm.totals = totals;

        //////////

        function closeDialog() {
            $mdDialog.hide();
        }
    }
})();

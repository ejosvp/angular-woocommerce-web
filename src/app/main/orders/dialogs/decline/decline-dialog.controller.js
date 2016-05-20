(function () {
    'use strict';

    angular
        .module('app.orders')
        .controller('DeclineDialogController', DeclineDialogController);

    /** @ngInject */
    function DeclineDialogController($mdDialog) {
        var vm = this;

        // Methods
        vm.closeDialog = closeDialog;

        //////////

        function closeDialog() {
            $mdDialog.hide();
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('app.core')
        .factory('DialogService', DialogService);

    /** @ngInject */
    function DialogService($mdDialog) {

        var service = {
            showAlert: showAlert,
            showConfirm: showConfirm
        };

        function showAlert(ev, title, content, ok) {
            var alert = $mdDialog.alert({
                clickOutsideToClose: true,
                targetEvent: ev,
                title: title || false,
                textContent: content || false,
                ok: ok || 'Ok'
            });

            $mdDialog.show(alert);
        }

        function showConfirm(ev, okCallback, cancelCallback, title, content, ok, cancel) {
            okCallback = okCallback || function () {};
            cancelCallback = cancelCallback || function () {};
            
            var confirm = $mdDialog.confirm({
                targetEvent: ev,
                title: title || false,
                textContent: content || false,
                ok: ok || 'Ok',
                cancel: cancel || 'Cancel'
            });

            $mdDialog.show(confirm).then(okCallback, cancelCallback);
        }

        return service;
    }

})();
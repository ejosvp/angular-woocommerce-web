(function ()
{
    'use strict';

    angular
        .module('app.drivers')
        .controller('DriversController', DriversController);

    /** @ngInject */
    function DriversController(Drivers, User)
    {
        var vm = this;

        // Data
        vm.drivers = Drivers.customers;
        vm.user = User;

        // Methods

        //////////
    }
})();

(function () {
    'use strict';

    angular
        .module('fuse')
        .factory('api', apiService);

    /** @ngInject */
    function apiService($resource, wpUsers, WOOCOMMERCE_API_URL) {

        var api = {};

        api.orders = $resource(WOOCOMMERCE_API_URL + '/orders/:id', {
            id: '@order.id'
        }, {
            'update': {method: 'PUT'}
        });

        api.users = $resource(WOOCOMMERCE_API_URL + '/customers/:id', {
            id: '@user.id'
        }, {
            'update': {method: 'PUT'}
        });

        api.user_meta = {
            get: wpUsers.getUserMeta,
            update: wpUsers.updateUserMeta
        };

        // Base Url
        api.baseUrl = 'app/data/';

        // api.sample = $resource(api.baseUrl + 'sample/sample.json');

        return api;
    }

})();
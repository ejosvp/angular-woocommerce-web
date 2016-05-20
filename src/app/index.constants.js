(function () {
    'use strict';

    angular
        .module('fuse')
        .constant('WORDPRESS_API_URL', 'https://www.futbolvivo.tv/deli-ecommerce/api/')
        .constant('WOOCOMMERCE_API_URL', 'https://www.futbolvivo.tv/deli-ecommerce/wc-api/v3')
        .constant('WEBSOCKETS_URL', 'wss://52.39.248.128:1234')

        .constant('USER_ROLE', {
            'ADMIN': 'administrator',
            'DRIVER': 'driver'
        })

        .constant('LOGIN_ROLES', ['administrator', 'deliadmin', 'driver'])
})();

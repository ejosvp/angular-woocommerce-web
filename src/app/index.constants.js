(function () {
    'use strict';

    angular
        .module('fuse')
        .constant('WORDPRESS_API_URL', 'http:s//52.25.11.31:8080/api/')
        .constant('WOOCOMMERCE_API_URL', 'https://52.25.11.31:8080/wc-api/v3')
        .constant('WEBSOCKETS_URL', 'wss://52.25.11.31:8084')

        .constant('USER_ROLE', {
            'ADMIN': 'administrator',
            'DRIVER': 'driver'
        })

        .constant('LOGIN_ROLES', ['administrator', 'deliadmin', 'driver'])
})();

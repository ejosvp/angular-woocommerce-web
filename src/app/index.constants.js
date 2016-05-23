(function () {
    'use strict';

    const hostname = window.location.hostname;

    angular
        .module('fuse')
        .constant('WORDPRESS_API_URL', 'https://' + hostname + ':8080/api/')
        .constant('WOOCOMMERCE_API_URL', 'https://' + hostname + ':8080/wc-api/v3')
        .constant('WEBSOCKETS_URL', 'wss://' + hostname + ':8084')

        .constant('USER_ROLE', {
            'ADMIN': 'store_admin',
            'DRIVER': 'driver'
        })

        .constant('LOGIN_ROLES', ['store_admin', 'driver'])
})();

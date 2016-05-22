(function () {
    'use strict';

    angular
        .module('app.orders', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, msNavigationServiceProvider) {
        // State
        $stateProvider
            .state('app.orders', {
                abstract: true,
                url: '/orders'
            })
            .state('app.orders.list', {
                role: ['administrator', 'driver'],
                url: '/list',
                views: {
                    'content@app': {
                        templateUrl: 'app/main/orders/orders.html',
                        controller: 'OrdersController as vm'
                    }
                },
                resolve: {
                    Orders: function (OrderService) {
                        return OrderService.getOrders();
                    }
                }
            })
            .state('app.orders.order', {
                role: 'administrator',
                url: '/{orderId:[0-9]+}',
                views: {
                    'content@app': {
                        templateUrl: 'app/main/orders/views/order/order.html',
                        controller: 'OrderController as vm'
                    },
                    'orderActions@app.orders.order': {
                        templateUrl: 'app/main/orders/views/order/orderActions.html'
                    },
                    'orderMapHeader@app.orders.order': {
                        templateUrl: 'app/main/orders/views/order/orderMapHeader.html'
                    }
                },
                resolve: {
                    Order: function ($stateParams, OrderService) {
                        return OrderService.getOrder($stateParams.orderId);
                    },
                    StoreInfo: function (wpUsers) {
                        return wpUsers.getUserMeta();
                    }
                }
            })
            .state('app.orders.order.confirm', {
                role: 'administrator',
                url: '/confirm',
                views: {
                    'content@app': {
                        templateUrl: 'app/main/orders/views/order/order.html',
                        controller: 'OrderConfirmController as vm'
                    },
                    'orderActions@app.orders.order.confirm': {
                        templateUrl: 'app/main/orders/views/confirm/orderActions.html'
                    },
                    'orderMapHeader@app.orders.order.confirm': {
                        templateUrl: 'app/main/orders/views/confirm/orderMapHeader.html'
                    },
                    'orderMapFooter@app.orders.order.confirm': {
                        templateUrl: 'app/main/orders/views/confirm/orderMapFooter.html'
                    }
                },
                resolve: {
                    Drivers: function (apiResolver) {
                        return apiResolver.resolve('users@get', {
                            'filter[role]': 'driver'
                        });
                    }
                }
            })
            .state('app.orders.order.invoice', {
                role: 'driver',
                url: '/invoice',
                views: {
                    'content@app': {
                        templateUrl: 'app/main/orders/views/invoice/invoice.html',
                        controller: 'InvoiceOrderController as vm'
                    }
                },
                resolve: {
                    Order: function (apiResolver, $stateParams) {
                        return apiResolver.resolve('orders@get', {'id': $stateParams.orderId});
                    },
                    DriversData: function (msApi) {
                        return msApi.resolve('drivers@get');
                    }
                }
            })
        ;

        // Navigation
        msNavigationServiceProvider.saveItem('orders', {
            title: 'Orders',
            icon: 'description',
            state: 'app.orders.list',
            weight: 2
        });
    }
})();
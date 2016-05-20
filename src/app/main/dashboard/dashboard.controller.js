(function ()
{
    'use strict';

    angular
        .module('app.dashboard')
        .controller('DashboardController', DashboardController);

    /** @ngInject */
    function DashboardController($scope, $interval, $mdSidenav, DashboardData, uiGmapGoogleMapApi)
    {
        var vm = this;

        // Data
        vm.dashboardData = DashboardData;
        vm.projects = vm.dashboardData.projects;

        // Widget 1
        vm.widget1 = vm.dashboardData.widget1;

        // Widget 2
        vm.widget2 = vm.dashboardData.widget2;

        // Widget 3
        vm.widget3 = vm.dashboardData.widget3;

        // Widget 4
        vm.widget4 = vm.dashboardData.widget4;

        // Widget 8
        vm.widget8 = {
            title    : vm.dashboardData.widget8.title,
            mainChart: {
                options: {
                    chart: {
                        type     : 'pieChart',
                        color    : ['#f44336', '#9c27b0', '#03a9f4', '#e91e63', '#ffc107'],
                        height   : 400,
                        margin   : {
                            top   : 0,
                            right : 0,
                            bottom: 0,
                            left  : 0
                        },
                        labelType: 'percent',
                        x        : function (d)
                        {
                            return d.label;
                        },
                        y        : function (d)
                        {
                            return d.value;
                        },
                        tooltip  : {
                            gravity: 's',
                            classes: 'gravity-s'
                        }
                    }
                },
                data   : vm.dashboardData.widget8.mainChart
            }
        };

        // Widget 9
        vm.widget9 = {
            title       : vm.dashboardData.widget9.title,
            weeklySpent : {
                title    : vm.dashboardData.widget9.weeklySpent.title,
                count    : vm.dashboardData.widget9.weeklySpent.count,
                chartData: []
            },
            totalSpent  : {
                title    : vm.dashboardData.widget9.totalSpent.title,
                count    : vm.dashboardData.widget9.totalSpent.count,
                chartData: []
            },
            totalBudget : vm.dashboardData.widget9.totalBudget,
            chart       : {
                config : {
                    refreshDataOnly: true,
                    deepWatchData  : true
                },
                options: {
                    chart: {
                        type                   : 'lineChart',
                        color                  : ['#00BCD4'],
                        height                 : 50,
                        margin                 : {
                            top   : 8,
                            right : 0,
                            bottom: 0,
                            left  : 0
                        },
                        isArea                 : true,
                        interpolate            : 'cardinal',
                        clipEdge               : true,
                        duration               : 500,
                        showXAxis              : false,
                        showYAxis              : false,
                        showLegend             : false,
                        useInteractiveGuideline: true,
                        x                      : function (d)
                        {
                            return d.x;
                        },
                        y                      : function (d)
                        {
                            return d.y;
                        },
                        yDomain                : [0, 9],
                        xAxis                  : {
                            tickFormat: function (d)
                            {
                                return vm.widget9.days[d];
                            }
                        },
                        interactiveLayer       : {
                            tooltip: {
                                gravity: 'e',
                                classes: 'gravity-e'
                            }
                        }
                    }
                }
            },
            days        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            ranges      : vm.dashboardData.widget9.ranges,
            currentRange: '',
            changeRange : function (range)
            {
                vm.widget9.currentRange = range;

                /**
                 * Update mini charts. They only have 1 dataset
                 * so we can do [0] without needing to iterate
                 * through in their data arrays
                 */
                vm.widget9.weeklySpent.chartData[0] = {
                    key   : vm.dashboardData.widget9.weeklySpent.chart.label,
                    values: vm.dashboardData.widget9.weeklySpent.chart.values[range]
                };

                vm.widget9.totalSpent.chartData[0] = {
                    key   : vm.dashboardData.widget9.totalSpent.chart.label,
                    values: vm.dashboardData.widget9.totalSpent.chart.values[range]
                };
            },
            init        : function ()
            {
                // Run this function once to initialize widget

                /**
                 * Update the range for the first time
                 */
                vm.widget9.changeRange('TW');
            }
        };
        
        // Now widget
        vm.nowWidget = {
            now   : {
                second: '',
                minute: '',
                hour  : '',
                day   : '',
                month : '',
                year  : ''
            },
            ticker: function ()
            {
                var now = moment();
                vm.nowWidget.now = {
                    second : now.format('ss'),
                    minute : now.format('mm'),
                    hour   : now.format('HH'),
                    day    : now.format('D'),
                    weekDay: now.format('dddd'),
                    month  : now.format('MMMM'),
                    year   : now.format('YYYY')
                };
            }
        };

        // Weather widget
        vm.weatherWidget = vm.dashboardData.weatherWidget;

        // Methods
        vm.toggleSidenav = toggleSidenav;
        vm.selectProject = selectProject;

        uiGmapGoogleMapApi.then(function (maps) {
            vm.markerMap = {
                center: {latitude : 40.7323443,longitude: -73.9940578},
                zoom  : 15,
                markers: [
                    {id: 1, coords: {latitude : 40.7343443,longitude: -73.9920578}},
                    {id: 2, coords: {latitude : 40.7313443,longitude: -73.9990578}},
                    {id: 3, coords: {latitude : 40.7353443,longitude: -73.9960578}},
                    {id: 4, coords: {latitude : 40.7333443,longitude: -73.9930578}},
                    {id: 5, coords: {latitude : 40.7323443,longitude: -73.9910578}},
                    {id: 6, coords: {latitude : 40.7363443,longitude: -73.9960578}},
                    {id: 7, coords: {latitude : 40.7303443,longitude: -73.9900578}}
                ],
                blue: {
                    id     : 0,
                    coords : {
                        latitude : 40.7323443,
                        longitude: -73.9940578
                    },
                    options: {
                        icon: {
                            anchor: new maps.Point(36, 36),
                            origin: new maps.Point(0, 0),
                            url   : '../assets/images/maps/blue.png'
                        }
                    }
                }
            };
        });

        //////////
        vm.selectedProject = vm.projects[0];

        // Initialize Widget 9
        vm.widget9.init();

        // Now widget ticker
        vm.nowWidget.ticker();

        var nowWidgetTicker = $interval(vm.nowWidget.ticker, 1000);

        $scope.$on('$destroy', function ()
        {
            $interval.cancel(nowWidgetTicker);
        });

        /**
         * Toggle sidenav
         *
         * @param sidenavId
         */
        function toggleSidenav(sidenavId)
        {
            $mdSidenav(sidenavId).toggle();
        }

        /**
         * Select project
         */
        function selectProject(project)
        {
            vm.selectedProject = project;
        }
    }

})();
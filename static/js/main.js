'use strict';

angular.module('SRApp', [
    'restangular',
    'ngRoute',
    'pie2dDirective',
    'pie3dDirective',
    'column2dDirective',
    'column3dDirective',
    'lineDirective',
    'socWatchControllers',
    'nocControllers',
])

.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        var partialsDir = '/static/partials/';
        $routeProvider
            .when('/', {
                redirectTo: '/socwatch'
            })
            .when('/socwatch', {
                templateUrl: partialsDir + 'socwatch.html',
                controller: 'socWatchCtrl'
            })
            .when('/noc', {
                templateUrl: partialsDir + 'noc.html',
                controller: 'nocCtrl'
            });

        $locationProvider.html5Mode(false).hashPrefix('!');
    }
]);

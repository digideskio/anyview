'use strict';

/* Controllers */

angular.module('nocControllers', [])

.controller('nocCtrl', ['$scope', '$window', 'Restangular', function nocCtrl($scope, $window, Restangular) {
    var names = ['CPU0', 'CPU1', 'GPU', 'EMIC0', 'EMIC1', 'EMIC2', 'DMA8C_1', 'DMA4C'];

    function prepareSeries(prefix) {
        if ($scope[prefix+'Data'] === undefined)
            return;

        var series = [];
        for (var i=0; i<names.length; i++) {
            if ($scope.consumers[i].checked) {
                series.push({
                    name: names[i]+'('+$scope[prefix+'_sel']+')',
                    data: $scope[prefix+'Data'][names[i]].mean
                });
            }
        }

        return series;
    }

    function changedFactory(sel, prefix) {
        return function() {
            Restangular.one('parse')
            .get({
                file: $scope[sel]
            })
            .then(function(data) {
                $scope[prefix+'Data'] = data;
                $scope.series[prefix] = prepareSeries(prefix);
                $scope.drawSeries = [$scope.series.base.concat($scope.series.treat)];
            });
        }
    }

    Restangular.setBaseUrl('/api/noc');

    $scope.consumers = [];
    $scope.drawSeries = [];
    $scope.series = {base: [], treat: []};

    // initialize display configuration
    for (var i=0; i<names.length; i++) {
        $scope.consumers.push({
            name: names[i],
            checked: false
        });
    }

    $scope.baseChanged = changedFactory('base_sel', 'base');
    $scope.treatChanged = changedFactory('treat_sel', 'treat');

    var dataSet = Restangular.one('dataset');
    dataSet.getList().then(function(data) {
        $scope.nocDataSet = data;
    });

    $scope.prepareData = function() {
        $scope.series.base = prepareSeries('base');
        $scope.series.treat = prepareSeries('treat');
        $scope.drawSeries = [$scope.series.base.concat($scope.series.treat)];
    }

}]);

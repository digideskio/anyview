'use strict';

/* Controllers */

angular.module('socWatchControllers', [])

.controller('socWatchCtrl', ['$scope', '$window', 'Restangular', function socWatchCtrl($scope, $window, Restangular) {

    function mergeAndSort(cat1, cat2, sort) {
        var ret = cat1.concat(cat2.filter(function(item) {
                return cat1.indexOf(item) < 0;
            }));

        if (sort === undefined)
            return ret;
        else
            return ret.sort(sort);
    }

    function fillGap(fullCat, cat, arr, fill) {
        var copyArr = arr.slice();
        for (var i=0; i<fullCat.length; i++) {
            if (cat.indexOf(fullCat[i]) < 0) {
                copyArr.splice(i, 0, fill);
            }
        }

        return copyArr;
    }

    function generateSeries(fullCat, thisCat, valArrs, fill, nameGenerator, stackGenerator) {
        var series = [];
        for (var i=0; i<valArrs.length; i++) {
            series.push({
                name: nameGenerator(i),
                data: fillGap(fullCat, thisCat, valArrs[i], fill),
                stack: stackGenerator === undefined ? undefined : stackGenerator(i),
            });
        }
        return series;
    }

    function generatePStateSeries(sel, fullCat) {
        var series = generateSeries(
            fullCat,
            $scope[sel+'Data'].pstate.states,
            $scope[sel+'Data'].pstate.residencies,
            0,
            function(i) {
                return 'Core '+i+' '+$scope[sel+'_sel'];
            },
            function(i) {
                return 'Core '+i;
            });

        // Remeber sync back to make the PState discrete view's color aligned
        // DO NOT overwrite any node under baseData/treatData, it would cause issue later when we switch to new data set
        $scope[sel+'PStateStates'] = fullCat;
        $scope[sel+'PStateResidencies'] = series.map(function(item) {
            return item.data;
        });

        var seriesWeight = generateSeries(
            fullCat,
            $scope[sel+'Data'].pstate.states,
            $scope[sel+'Data'].pstate.power,
            0,
            function(i){},
            function(i){});

        // Remeber sync back to make the PState Power discrete view's color aligned
        // DO NOT overwrite any node under baseData/treatData, it would cause issue later when we switch to new data set
        $scope[sel+'PStateValuesWeight'] = seriesWeight.map(function(item) {
            return item.data;
        });

        return series;
    }

    function generateIrqsSeries(sel, fullCat) {
        var series = generateSeries(
            fullCat,
            $scope[sel+'Data'].irqs.names,
            [$scope[sel+'Data'].irqs.count],
            0,
            function(i) {
                return $scope[sel+'_sel'];
            });

        // Remeber sync back to make the Pie view's color aligned
        $scope[sel+'Irqs'] = [{
            tag: fullCat,
            values: series.map(function(item) {
                return item.data;
            })[0],
        }];

        return series;
    }

    function changedFactory(sel, prefix) {
        return function() {
            Restangular.one('parse')
            .get({
                file: $scope[sel]
            })
            .then(function(data) {
                // C-State & P-State view
                $scope[prefix+'Data'] = data;
                $scope[prefix+'PStateStates'] = data.pstate.states;
                $scope[prefix+'PStateResidencies'] = data.pstate.residencies;
                $scope[prefix+'PStatePower'] = data.pstate.power;
                $scope[prefix+'C0Dist'] = [{
                    tag: data.core_list,
                    values: data.cstate.c0_dist
                }];
                $scope[prefix+'C0Power'] = [{
                    tag: data.core_list,
                    values: data.cstate.power
                }];

                // Top 10 IRQs waking VMM discrete view
                $scope[prefix+'Irqs'] = [{
                    tag: data.irqs.names,
                    values: data.irqs.count,
                }];

                // Dual view
                if ($scope.base_sel !== undefined && $scope.treat_sel !== undefined) {
                    // Synthesized C0 residency view
                    var li = [];
                    li.push({
                        name: $scope.base_sel,
                        data: $scope.baseC0Dist[0].values,
                    });
                    li.push({
                        name: $scope.treat_sel,
                        data: $scope.treatC0Dist[0].values,
                    });

                    $scope.c0DistCompare = [{
                        categories: data.core_list,
                        series: li
                    }];

                    // Synthesized C0 power view
                    li = [];
                    // Clone here to avoid changing pie view
                    var v = $scope.baseC0Power[0].values.slice();
                    v.push(v.reduce(function(pv, cv, ci, arr) {
                        return pv + cv;
                    }));
                    li.push({
                        name: $scope.base_sel,
                        data: v,
                    });

                    v = $scope.treatC0Power[0].values.slice();
                    v.push(v.reduce(function(pv, cv, ci, arr) {
                        return pv + cv;
                    }));
                    li.push({
                        name: $scope.treat_sel,
                        data: v,
                    });

                    var cat = data.core_list.slice();
                    cat.push('Device');
                    $scope.c0PowerCompare = [{
                        categories: cat,
                        series: li
                    }];

                    // P-State synthesized view
                    var mergedPStates = mergeAndSort(
                        $scope.baseData.pstate.states,
                        $scope.treatData.pstate.states,
                        function(a, b) {
                            return parseInt(a.split(' ')[0]) - parseInt(b.split(' ')[0]);
                        });

                    $scope.pStateCompare = [{
                        categories: mergedPStates,
                        series: generatePStateSeries('base', mergedPStates).concat(
                            generatePStateSeries('treat', mergedPStates))
                    }];

                    // IRQs synthesized view
                    var mergedIrqsNames = mergeAndSort(
                        $scope.baseData.irqs.names,
                        $scope.treatData.irqs.names);

                    $scope.irqsCompare = [{
                        categories: mergedIrqsNames,
                        series: generateIrqsSeries('base', mergedIrqsNames).concat(
                            generateIrqsSeries('treat', mergedIrqsNames))
                    }];
                }
            });
        }
    };

    Restangular.setBaseUrl('/api/socwatch');

    // Boradcast 'resize' event for Highcharts to redraw with right size
    $scope.broadcast = function() {
        angular.element($window).trigger('resize');
    }

    $scope.baseChanged = changedFactory('base_sel', 'base');
    $scope.treatChanged = changedFactory('treat_sel', 'treat');

    var dataSet = Restangular.one('dataset');
    dataSet.getList().then(function(data) {
        $scope.socWatchDataSet = data;
    });

    $scope.cstate = false;
    $scope.c0summary = true;
    $scope.pstate = true;
    $scope.irqs = true;

}]);

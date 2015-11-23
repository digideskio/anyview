angular.module('pie3dDirective', [])

.directive("pie3d", function() {
    function link(scope, element, attrs) {
        var whichSliced = scope.$eval(attrs.sliced),
        showInLegend = scope.$eval(attrs.showlegend),
        hasLabel = scope.$eval(attrs.haslabel),
        distance = scope.$eval(attrs.distance),
        options = {
            chart: {
                type: 'pie',
                options3d: {
                    enabled: true,
                    alpha: 45,
                    beta: 0,
                },
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    depth: 35,
                    dataLabels: {
                        enabled: hasLabel,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        distance: (distance === undefined) ? 30 : distance,
                    },
                    showInLegend: showInLegend,
                },
                series: {
                    animation : {
                        duration: 1500
                    },
                }
            },

            credits: {
                enabled: false
            },
        };

        options.chart.renderTo = element[0];
        options.plotOptions.pie.size = '80%';

        var chart = new Highcharts.Chart(options);

        scope.$watch(attrs.data, function(data) {
            chart.setTitle({
                text: attrs.title,
            });

            chart.addSeries({
                name: attrs.seriestag,
                colorByPoint: true,
                data: function() {
                    var tag = data.tag,
                    v = data.values,
                    li = [],
                    colors = Highcharts.getOptions().colors;
                    // skip zero slices and explode selected slice
                    for (var i=0; i<v.length; i++) {
                        if (v[i] > 0.01) {
                            li.push({
                                name: tag[i],
                                y: v[i],
                                color: colors[i],
                                sliced: (whichSliced === i),
                                selected: (whichSliced === i),
                            });
                        }
                    }
                    return li;
                }()
            });
        });
    }

    return {
        link: link
    };
});

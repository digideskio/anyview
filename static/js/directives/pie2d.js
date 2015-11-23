angular.module('pie2dDirective', [])

.directive("pie2d", function() {
    function link(scope, element, attrs) {
        var whichSliced = scope.$eval(attrs.sliced),
        showInLegend = scope.$eval(attrs.showlegend),
        hasLabel = scope.$eval(attrs.haslabel),
        distance = scope.$eval(attrs.distance),
        options = {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie',
                spacingTop: 0,
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: hasLabel,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        },
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
                    var tag = data.tags,
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
    };

    return {
        link: link
    };
});

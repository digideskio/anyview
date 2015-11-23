angular.module('column3dDirective', [])

.directive("column3d", function() {
    function link(scope, element, attrs) {
        var options = {
            chart: {
                type: 'column',
                options3d: {
                    enabled: true,
                    alpha: 10,
                    beta: 10,
                    viewDistance: 25,
                    depth: 100
                },
                marginTop: 15,
                marginRight: 40,
                animation : {
                    duration: 2500
                },
            },

            yAxis: {
                allowDecimals: false,
                min: 0,
                title: {
                    text: attrs.ytitle
                }
            },

            tooltip: {
                headerFormat: '<b>{point.key}</b><br>',
                pointFormat: '<span style="color:{series.color}">\u25CF</span> {series.name}: {point.y}'
            },

            plotOptions: {
                column: {
                    depth: 40,
                },
                series: {
                    animation: {
                        duration: 2000
                    }
                }
            },
            credits: {
                enabled: false
            },
        };

        options.chart.renderTo = element[0];
        var chart = new Highcharts.Chart(options);

        scope.$watch(attrs.data, function(data) {
            chart.setTitle({
                text: attrs.title,
            });

            var v = data.series,
                colors = Highcharts.getOptions().colors;
            for (i=0; i<v.length; i++) {
                //v[i].color = colors[i];
                chart.addSeries(v[i]);
            }

            chart.xAxis[0].setCategories(data.categories);
        });
    }

    return {
        link: link
    };
});

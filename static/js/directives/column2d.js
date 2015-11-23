angular.module('column2dDirective', [])

.directive("column2d", function() {
    function link(scope, element, attrs) {
        var options = {
            chart: {
                type: 'column',
                animation : {
                    duration: 1500
                }
            },

            yAxis: {
                allowDecimals: false,
                min: 0,
                title: {
                    text: attrs.ytitle
                }
            },

            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f} '+attrs.unit+'</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },

            plotOptions: {
                column: {
                    stacking: attrs.stacking === undefined ? false : attrs.stacking
                },
            },
            credits: {
                enabled: false
            },
        };
        var colors = Highcharts.getOptions().colors;

        options.chart.renderTo = element[0];
        var chart = new Highcharts.Chart(options);

        scope.$watch(attrs.data, function(data) {
            chart.setTitle({
                text: attrs.title
            });

            v = data.series,
            categories = data.categories;

            data.series.map(function(v) {
                chart.addSeries(v);
            });

            chart.xAxis[0].setCategories(categories);
        });
    }

    return {
        link: link
    };
});

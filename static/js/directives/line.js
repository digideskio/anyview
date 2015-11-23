angular.module('lineDirective', [])

.directive("line", function() {
    function link(scope, element, attrs) {
        var options = {
            chart: {
                type: 'line',
            },
            title: {
                text: 'NoC',
                x: -20 //center
            },
            yAxis: {
                title: {
                    text: 'Rate (KB/s)'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.0f} '+attrs.unit+'</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle',
                borderWidth: 0
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

            var colors = Highcharts.getOptions().colors;

            for (var i=chart.series.length-1; i>-1; i--) {
                chart.series[i].remove(true);
            }

            for (var i=0; i<data.length; i++) {
                chart.addSeries(data[i]);
                data[i].color = colors[i];
            }

            //chart.xAxis[0].setCategories();
        });
    }

    return {
        link: link
    }
});

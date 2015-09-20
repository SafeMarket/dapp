'use strict'

angular.module('app.chart.directives', [])

.directive('flotChart', [ ->
    return {
        restrict: 'A'
        scope:
            data: '='
            options: '='
        link: (scope, ele, attrs) ->
            data = scope.data
            options = scope.options
            
            # console.log data
            # console.log options

            plot = $.plot(ele[0], data, options);

    }
])
.directive('flotChartRealtime', [ ->
    return {
        restrict: 'A'
        link: (scope, ele, attrs) ->
            data = []
            totalPoints = 300
            getRandomData = ->
                data = data.slice(1)  if data.length > 0
                
                # Do a random walk
                while data.length < totalPoints
                    prev = (if data.length > 0 then data[data.length - 1] else 50)
                    y = prev + Math.random() * 10 - 5
                    if y < 0
                        y = 0
                    else y = 100  if y > 100
                    data.push y
                
                # Zip the generated y values with the x values
                res = []
                i = 0

                while i < data.length
                    res.push [
                        i
                        data[i]
                    ]
                    ++i
                res

            update = ->
                plot.setData [getRandomData()]
                
                # Since the axes don't change, we don't need to call plot.setupGrid()
                plot.draw()
                setTimeout update, updateInterval
                return
            data = []
            totalPoints = 300
            updateInterval = 200
            plot = $.plot(ele[0], [getRandomData()],
                series:
                    lines:
                        show: true
                        fill: true
                    shadowSize: 0
                yaxis:
                    min: 0
                    max: 100
                xaxis:
                    show: false
                grid:
                    hoverable: true
                    borderWidth: 1
                    borderColor: '#eeeeee'
                colors: ["#5B90BF"]
            )
            update()

    }
])
.directive('sparkline', [ ->
    return {
        restrict: 'A'
        scope:
            data: '='
            options: '='
        link: (scope, ele, attrs) ->
            data = scope.data
            options = scope.options
            sparkResize = undefined

            sparklineDraw = ->
                ele.sparkline(data, options)

            $(window).resize( (e) ->
                clearTimeout(sparkResize)
                sparkResize = setTimeout(sparklineDraw, 200)
            )

            sparklineDraw()
    }
])
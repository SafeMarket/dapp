'use strict'

angular.module('app.ui.map', [])

.directive('uiJvectormap', [ ->

    return {
        restrict: 'A'
        scope:
            options: '='
        link: (scope, ele, attrs) ->
            options = scope.options
            ele.vectorMap(options)
    }
])

.controller('jvectormapCtrl', [
    '$scope'
    ($scope) ->
        marker_data = [
            {"latLng":[40.71,-74.00],"name":"New York"}
            {"latLng":[39.90,116.40],"name":"Beijing"}
            {"latLng":[31.23,121.47],"name":"Shanghai"}
            {"latLng":[-33.86,151.20],"name":"Sydney"}
            {"latLng":[-37.81,144.96],"name":"Melboune"}
            {"latLng":[37.33,-121.89],"name":"San Jose"}
            {"latLng":[1.3,103.8],"name":"Singapore"}
            {"latLng":[47.60,-122.33],"name":"Seattle"}
            {"latLng":[41.87,-87.62],"name":"Chicago"}
            {"latLng":[37.77,-122.41],"name":"San Francisco"}
            {"latLng":[32.71,-117.16],"name":"San Diego"}
            {"latLng":[51.50,-0.12],"name":"London"}
            {"latLng":[48.85,2.35],"name":"Paris"}
            {"latLng":[52.52,13.40],"name":"Berlin"}
            {"latLng":[-26.20,28.04],"name":"Johannesburg"}
            {"latLng":[35.68,139.69],"name":"Tokyo"}
            {"latLng":[13.72,100.52],"name":"Bangkok"}
            {"latLng":[37.56,126.97],"name":"Seoul"}
            {"latLng":[41.87,12.48],"name":"Roma"}
            {"latLng":[45.42,-75.69],"name":"Ottawa"}
            {"latLng":[55.75,37.61],"name":"Moscow"}
            {"latLng":[-22.90,-43.19],"name":"Rio de Janeiro"}
            # {"latLng":[43.65,-79.38],"name":"Toronto"}
            # {"latLng":[42.35,-71.05],"name":"Boston"}
            # {"latLng":[49.26,-123.11],"name":"Vancouver"}
        ]

        # you should also load the corresponding map, in this case, jquery.vmap.world.js
        $scope.worldMap =
            map: 'world_mill_en' 
            markers: marker_data
            normalizeFunction: 'polynomial'
            backgroundColor: null
            zoomOnScroll: false
            regionStyle:
                initial: 
                    fill: '#EEEFF3'
                hover: 
                    fill: $scope.color.primary
            markerStyle:
                initial: 
                    fill: '#BF616A',
                    stroke: 'rgba(191,97,106,.8)',
                    "fill-opacity": 1,
                    "stroke-width": 9,
                    "stroke-opacity": 0.5,
                 hover:
                    stroke: 'black',
                    "stroke-width": 2

])
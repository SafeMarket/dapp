'use strict';

angular.module('app.ui.directives', [])

.directive('uiTime', [ ->
    return {
        restrict: 'A'
        link: (scope, ele) ->
            startTime = ->
                today = new Date()
                h = today.getHours()
                m = today.getMinutes()
                s = today.getSeconds()

                m = checkTime(m)
                s = checkTime(s)

                time = h+":"+m+":"+s
                ele.html(time)
                t = setTimeout(startTime,500)
            checkTime = (i) -> # add a zero in front of numbers<10
                if (i<10) then i = "0" + i
                return i

            startTime()
    }
])

# .directive('uiWeather', [ ->
#     return {
#         restrict: 'A'
#         link: (scope, ele, attrs) ->
#             color = attrs.color
#             # https://github.com/darkskyapp/skycons
#             # CLEAR_DAY, CLEAR_NIGHT, PARTLY_CLOUDY_DAY, PARTLY_CLOUDY_NIGHT, CLOUDY
#             # RAIN, SLEET, SNOW, WIND, FOG
#             icon = Skycons[attrs.icon]

#             skycons = new Skycons({
#                 "color": color
#                 "resizeClear": true
#             })

#             skycons.add(ele[0], icon)
#             skycons.play()
#     }
# ])

.directive('uiNotCloseOnClick', [ ->
    return {
        restrict: 'A'
        compile: (ele, attrs) ->
            ele.on('click', (event) ->
                event.stopPropagation()
            )
    }
])

.directive('slimScroll', [ ->
    return {
        restrict: 'A'
        link: (scope, ele, attrs) ->
            ele.slimScroll({
                height: attrs.scrollHeight || '100%'
            })
    }
])

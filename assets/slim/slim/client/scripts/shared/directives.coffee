'use strict';

angular.module('app.directives', [])

.directive('imgHolder', [ ->
    return {
        restrict: 'A'
        link: (scope, ele, attrs) ->
            Holder.run(
                images: ele[0]
            )
    }
])


# add class for specific pages
.directive('customPage', () ->
    return {
        restrict: "A"
        controller: [
            '$scope', '$element', '$location'
            ($scope, $element, $location) ->
                path = ->
                    return $location.path()

                addBg = (path) ->
                    # remove all the classes
                    $element.removeClass('body-wide body-err body-lock body-auth')

                    # add certain class based on path
                    switch path
                        when '/404', '/pages/404', '/pages/500' then $element.addClass('body-wide body-err')
                        when '/pages/signin', '/pages/signup', '/pages/forgot-password' then $element.addClass('body-wide body-auth')
                        when '/pages/lock-screen' then $element.addClass('body-wide body-lock')

                addBg( $location.path() )

                $scope.$watch(path, (newVal, oldVal) ->
                    if newVal is oldVal
                        return
                    addBg($location.path())
                )
        ]
    }
)

# switch stylesheet file
.directive('uiColorSwitch', [ ->
    return {
        restrict: 'A'
        link: (scope, ele, attrs) ->
            ele.find('.color-option').on('click', (event)->
                $this = $(this)
                hrefUrl = undefined

                style = $this.data('style')
                if style is 'loulou'
                    hrefUrl = 'styles/main.css'
                    $('link[href^="styles/main"]').attr('href',hrefUrl)
                else if style
                    style = '-' + style
                    hrefUrl = 'styles/main' + style + '.css'
                    $('link[href^="styles/main"]').attr('href',hrefUrl)
                else
                    return false

                event.preventDefault()
            )
    }
])


# history back button
.directive('goBack', [ ->
    return {
        restrict: "A"
        controller: [
            '$scope', '$element', '$window'
            ($scope, $element, $window) ->
                $element.on('click', ->
                    $window.history.back()
                )
        ]
    }
])


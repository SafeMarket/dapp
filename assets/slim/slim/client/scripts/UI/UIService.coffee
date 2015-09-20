'use strict';

angular.module('app.ui.services', [])

.factory('logger', [ ->

    # toastr setting.
    toastr.options =
        "closeButton": true
        "positionClass": "toast-bottom-right"
        "timeOut": "3000"

    logIt = (message, type) ->
        toastr[type](message)

    return {
        log: (message) ->
            logIt(message, 'info')
            # return is needed, otherwise AngularJS will error out 'Referencing a DOM node in Expression', thanks https://groups.google.com/forum/#!topic/angular/bsTbZ86WAY4
            return 

        logWarning: (message) ->
            logIt(message, 'warning')
            return

        logSuccess: (message) ->
            logIt(message, 'success')
            return

        logError: (message) ->
            logIt(message, 'error')
            return
    }
])










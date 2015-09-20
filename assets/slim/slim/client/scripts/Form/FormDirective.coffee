

angular.module('app.ui.form.directives', [])

# Dependency: http://www.eyecon.ro/bootstrap-slider/ OR https://github.com/seiyria/bootstrap-slider
.directive('uiRangeSlider', [ ->
    return {
        restrict: 'A'
        link: (scope, ele) ->
            ele.slider()
    }
])

# Dependency: https://github.com/grevory/bootstrap-file-input
.directive('uiFileUpload', [ ->
    return {
        restrict: 'A'
        link: (scope, ele) ->
            ele.bootstrapFileInput()
    }
])

# Dependency: https://github.com/xixilive/jquery-spinner
.directive('uiSpinner', [ ->
    return {
        restrict: 'A'
        compile: (ele, attrs) -> # link and compile do not work together
            ele.addClass('ui-spinner')

            return {
                post: ->
                    ele.spinner()
            }

        # link: (scope, ele) -> # link and compile do not work together
    }

])

# Dependency: https://github.com/rstaib/jquery-steps
.directive('uiWizardForm', [ ->
    return {
        link: (scope, ele) ->
            ele.steps()
    }
])



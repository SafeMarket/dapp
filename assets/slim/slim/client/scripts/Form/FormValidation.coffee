'use strict'

angular.module('app.form.validation', [])

.controller('wizardFormCtrl', [
    '$scope'
    ($scope) ->
        $scope.wizard =
            firstName: 'some name'
            lastName: ''
            email: ''
            password: ''
            age: ''
            address: ''

        $scope.isValidateStep1 = ->
            console.log $scope.wizard_step1
            console.log $scope.wizard.firstName isnt ''
            console.log $scope.wizard.lastName is ''
            console.log $scope.wizard.firstName isnt '' && $scope.wizard.lastName isnt ''
            # console.log $scope.wizard_step1.$valid


        $scope.finishedWizard = ->
            console.log 'yoo'

])

.controller('formConstraintsCtrl', [
    '$scope'
    ($scope) ->
        $scope.form =
            required: ''
            minlength: ''
            maxlength: ''
            length_rage: ''
            type_something: ''
            confirm_type: ''
            foo: ''
            email: ''
            url: ''
            num: ''
            minVal: ''
            maxVal: ''
            valRange: ''
            pattern: ''

        original = angular.copy($scope.form)

        $scope.revert = ->
            $scope.form = angular.copy(original)
            $scope.form_constraints.$setPristine()

        $scope.canRevert = ->
            return !angular.equals($scope.form, original) || !$scope.form_constraints.$pristine

        $scope.canSubmit = ->
            return $scope.form_constraints.$valid && !angular.equals($scope.form, original)

])

.controller('signinCtrl', [
    '$scope'
    ($scope) ->
        $scope.user =
            email: ''
            password: ''

        $scope.showInfoOnSubmit = false

        original = angular.copy($scope.user)

        $scope.revert = ->
            $scope.user = angular.copy(original)
            $scope.form_signin.$setPristine()

        $scope.canRevert = ->
            return !angular.equals($scope.user, original) || !$scope.form_signin.$pristine

        $scope.canSubmit = ->
            return $scope.form_signin.$valid && !angular.equals($scope.user, original)

        $scope.submitForm = ->
             $scope.showInfoOnSubmit = true
             $scope.revert()
])

.controller('signupCtrl', [
    '$scope'
    ($scope) ->
        $scope.user = 
            name: ''
            email: ''
            password: ''
            confirmPassword: ''
            age: ''

        $scope.showInfoOnSubmit = false

        original = angular.copy($scope.user)

        $scope.revert = ->
            $scope.user = angular.copy(original)
            $scope.form_signup.$setPristine()
            $scope.form_signup.confirmPassword.$setPristine()

        $scope.canRevert = ->
            return !angular.equals($scope.user, original) || !$scope.form_signup.$pristine

        $scope.canSubmit = ->
            return $scope.form_signup.$valid && !angular.equals($scope.user, original)

        $scope.submitForm = ->
             $scope.showInfoOnSubmit = true
             $scope.revert()            

])

# used for confirm password
# Note: if you modify the "confirm" input box, and then update the target input box to match it, it'll still show invalid style though the values are the same now
# Note2: also remember to use " ng-trim='false' " to disable the trim
.directive('validateEquals', [ () ->
    return {
        require: 'ngModel'
        link: (scope, ele, attrs, ngModelCtrl) ->
            validateEqual = (value) ->
                valid = ( value is scope.$eval(attrs.validateEquals) )
                ngModelCtrl.$setValidity('equal', valid)
                return valid? value : undefined

            ngModelCtrl.$parsers.push(validateEqual)
            ngModelCtrl.$formatters.push(validateEqual)

            scope.$watch(attrs.validateEquals, (newValue, oldValue) ->
                if newValue isnt oldValue # so that watch only fire after change, otherwise watch will fire on load and add invalid style to "confirm" input box
                    ngModelCtrl.$setViewValue(ngModelCtrl.$ViewValue)
            )
    }
])


# Comment out, use AngularJS built in directive instead.
# unique string, use on unique username, blacklist etc. 

# angularjs already support it, yet you get the picture
# validate number value, jquery free, only number >=x,  <= y are valid, e.g. 1~100, >= 0, <= -1...
# use with AngularJS built in type="number"
# .directive('minvalue', [ ->
#     return {
#         restrict: 'A'
#         require: 'ngModel'
#         link: (scope, ele, attrs, ngModelCtrl) ->
#             minVal = attrs.minvalue

#             validateVal = (value) ->
#                 valid = if value >= minVal then true else false
#                 ngModelCtrl.$setValidity('minVal', valid)

#             scope.$watch(attrs.ngModel, validateVal)

#     }
# ])
# .directive('maxvalue', [ ->
#     return {
#         restrict: 'A'
#         require: 'ngModel'
#         link: (scope, ele, attrs, ngModelCtrl) ->
#             maxVal = attrs.maxvalue

#             validateVal = (value) ->
#                 valid = if value <= maxVal then true else false
#                 ngModelCtrl.$setValidity('maxVal', valid)

#             scope.$watch(attrs.ngModel, validateVal)

#     }
# ])
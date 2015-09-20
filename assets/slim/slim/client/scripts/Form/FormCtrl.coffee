'use strict'

# Dependencies: jQuery, related jQuery plugins

angular.module('app.ui.form.ctrls', [])

.controller('TagsDemoCtrl', [
    '$scope'
    ($scope) ->
        $scope.tags = ['foo', 'bar']
])
.controller('DatepickerDemoCtrl', [
    '$scope'
    ($scope) ->
        $scope.today = ->
            $scope.dt = new Date()
        $scope.today()

        $scope.showWeeks = true
        $scope.toggleWeeks = ->
            $scope.showWeeks = ! $scope.showWeeks

        $scope.clear = ->
            $scope.dt = null

        # Disable weekend selection
        $scope.disabled = (date, mode) ->
            return ( mode is 'day' && ( date.getDay() is 0 || date.getDay() is 6 ) )

        $scope.toggleMin = ->
            $scope.minDate = ( $scope.minDate ) ? null : new Date()
        $scope.toggleMin()

        $scope.open = ($event) ->
            $event.preventDefault()
            $event.stopPropagation()

            $scope.opened = true

        $scope.dateOptions = {
            'year-format': "'yy'"
            'starting-day': 1
        }

        $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'shortDate']
        $scope.format = $scope.formats[0]
])
.controller('TimepickerDemoCtrl', [
    '$scope'
    ($scope) ->
        $scope.mytime = new Date()

        $scope.hstep = 1
        $scope.mstep = 15

        $scope.options =
            hstep: [1, 2, 3]
            mstep: [1, 5, 10, 15, 25, 30]

        $scope.ismeridian = true
        $scope.toggleMode = ->
            $scope.ismeridian = ! $scope.ismeridian

        $scope.update = ->
            d = new Date()
            d.setHours( 14 )
            d.setMinutes( 0 )
            $scope.mytime = d

        $scope.changed = ->
            console.log('Time changed to: ' + $scope.mytime)

        $scope.clear = ->
            $scope.mytime = null  
])
.controller('TypeaheadCtrl', [
    '$scope'
    ($scope) ->
        $scope.selected = undefined
        $scope.states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Dakota', 'North Carolina', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']
])
.controller('RatingDemoCtrl', [
    '$scope'
    ($scope) ->
        $scope.rate = 7
        $scope.max = 10
        $scope.isReadonly = false

        $scope.hoveringOver = (value) ->
            $scope.overStar = value
            $scope.percent = 100 * (value / $scope.max)

        $scope.ratingStates = [
            {stateOn: 'glyphicon-ok-sign', stateOff: 'glyphicon-ok-circle'}
            {stateOn: 'glyphicon-star', stateOff: 'glyphicon-star-empty'}
            {stateOn: 'glyphicon-heart', stateOff: 'glyphicon-ban-circle'}
            {stateOn: 'glyphicon-heart'}
            {stateOff: 'glyphicon-off'}
        ]
])
# .controller('TagsDemoCtrl', [
#     '$scope'
#     ($scope) ->
#         $scope.cities = [
#             { "value": 1 , "text": "Amsterdam"   , "continent": "Europe"    }
#             { "value": 4 , "text": "Washington"  , "continent": "America"   }
#             { "value": 7 , "text": "Sydney"      , "continent": "Australia" }
#             { "value": 10, "text": "Beijing"     , "continent": "Asia"      }
#             { "value": 13, "text": "Cairo"       , "continent": "Africa"    }
#         ]

#         $scope.getTagClass = (city) ->
#             switch (city.continent)
#                 when 'Europe'   then return 'label label-info'
#                 when 'America'  then return 'label label-danger'
#                 when 'Australia'then return 'label label-success'
#                 when 'Africa'   then return 'label label-primary'
#                 when 'Asia'     then return 'label label-warning'        
# ])


'use strict'

angular.module('app.page.ctrls', [])

.controller('invoiceCtrl', [
    '$scope', '$window'
    ($scope, $window) ->

        $scope.printInvoice = ->
            printContents = document.getElementById('invoice').innerHTML;
            originalContents = document.body.innerHTML;        
            popupWin = window.open();
            popupWin.document.open()
            popupWin.document.write('<html><head><link rel="stylesheet" type="text/css" href="styles/main.css" /></head><body onload="window.print()">' + printContents + '</html>');
            popupWin.document.close();
])


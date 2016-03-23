/* globals angular */

angular.module('app').controller('AffiliateModalController', ($scope, user, affiliate, $modalInstance, Affiliate, AffiliateReg, utils, growl) => {

  $scope.isEditing = !!affiliate
  $scope.code = affiliate ? affiliate.code : ''
  $scope.owner = (affiliate ? affiliate.owner : user.getAccount()).replace('0x', '')
  $scope.coinbase = (affiliate ? affiliate.coinbase : user.getAccount()).replace('0x', '')

  $scope.cancel = function cancel() {
    $modalInstance.dismiss()
  }

  $scope.submit = function submit() {

    const owner = utils.hexify($scope.owner)
    const coinbase = utils.hexify($scope.coinbase)

    try {
      utils.check({
        code: $scope.code,
        owner,
        coinbase
      }, {
        code: {
          presence: true,
          type: 'string'
        },
        owner: {
          presence: true,
          type: 'address'
        },
        coinbase: {
          presence: true,
          type: 'address'
        }
      })
    } catch (e) {
      return growl.addErrorMessage(e)
    }

    if (!$scope.isEditing) {
      if (AffiliateReg.getIsCodeTaken($scope.code)) {
        growl.addErrorMessage(`The code "${$scope.code}"" is taken`)
        return
      }

      Affiliate.create($scope.code, owner, coinbase).then(() => {
        user.addAffiliate($scope.code)
        $modalInstance.close()
      })

      return
    }

    affiliate.set(owner, coinbase).then(() => {
      $modalInstance.close()
    })

  }

})

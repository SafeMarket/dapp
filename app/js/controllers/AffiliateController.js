/* globals angular */

angular.module('app').controller('AffiliateController', ($scope, modals, user) => {

  function updateAffiliates() {
    $scope.affiliates = user.getAffiliates()
  }

  updateAffiliates()

  $scope.openAffiliateModal = function openAffiliateModal(affiliate) {
    modals.openAffiliate(affiliate).result.then(updateAffiliates)
  }

  $scope.deleteAffiliate = function deleteAffiliate(affiliate) {
    affiliate.delete().then(updateAffiliates)
  }

})

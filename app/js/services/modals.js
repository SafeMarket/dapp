/* globals angular */

angular.module('app').service('modals', ($modal) => {

  const modals = this

  this.currentController = null
  this.currentModalInstance = null

  function openModal(options) {

    modals.currentController = options.controller
    modals.currentModalInstance = $modal.open(options)

    modals.currentModalInstance.opened.then(() => {
      window.scrollTo(0, 1)
    })

    modals.currentModalInstance.result.then(() => {
      modals.currentController = null
      modals.currentModalInstance = null
    })

    return modals.currentModalInstance
  }

  this.closeInstance = function closeInstance() {
    if (this.currentModalInstance) {
      this.currentModalInstance.dismiss()
    }
  }

  this.openStore = function closeInstance(store) {
    return openModal({
      size: 'md',
      templateUrl: 'storeModal.html',
      controller: 'StoreModalController',
      resolve: {
        store: function resolveStore() {
          return store
        }
      }
    })
  }

  this.openSubmarket = function openSubmarket(submarket) {
    return openModal({
      size: 'md',
      templateUrl: 'submarketModal.html',
      controller: 'SubmarketModalController',
      resolve: {
        submarket: function resolveSubmarket() {
          return submarket
        }
      }
    })
  }

  this.openSettings = function openSettings() {
    return openModal({
      size: 'lg',
      templateUrl: 'settingsModal.html',
      controller: 'SettingsModalController'
    })
  }

  this.openAliases = function openAliases(aliasable) {
    return openModal({
      size: 'lg',
      templateUrl: 'aliasesModal.html',
      controller: 'aliasesModalController',
      resolve: {
        aliasable: function resolveAliasable() {
          return aliasable
        }
      }
    })
  }

  this.openPayment = function openPayment(addr, amount, currency) {
    return openModal({
      size: 'lg',
      templateUrl: 'paymentModal.html',
      controller: 'PaymentModalController',
      resolve: {
        addr: function resolveAddr() {
          return addr
        },
        amount: function resolveAmount() {
          return amount
        },
        currency: function resolveCurrency() {
          return currency
        }
      }
    })
  }

  this.openWithdrawl = function openWithdrawl(order) {
    return openModal({
      size: 'lg',
      templateUrl: 'withdrawlModal.html',
      controller: 'WithdrawlModalController',
      resolve: {
        order: function resolveOrder(){
          return order
        }
      }
    })
  }

  this.openResolution = function openResolution(order) {
    return openModal({
      size: 'sm',
      templateUrl: 'resolutionModal.html',
      controller: 'ResolutionModalController',
      resolve: {
        order: function resolveOrder() {
          return order
        }
      }
    })
  }

  this.openImportStore = function openImportStore() {
    return openModal({
      size: 'md',
      templateUrl: 'importStoreModal.html',
      controller: 'ImportStoreModalController'
    })
  }

  this.openImportSubmarket = function openImportSubmarket() {
    return openModal({
      size: 'md',
      templateUrl: 'importSubmarketModal.html',
      controller: 'ImportSubmarketModalController'
    })
  }

  this.openLeaveReview = function openLeaveReview(order) {
    return openModal({
      size: 'md',
      templateUrl: 'leaveReviewModal.html',
      controller: 'LeaveReviewModalController',
      resolve: {
        order: function resolveOrder() {
          return order
        }
      }
    })
  }

  this.openTxMonitor = function openTxMonitor() {
    return openModal({
      size: 'md',
      templateUrl: 'txMonitorModal.html',
      controller: 'txMonitorModalController',
      resolve: {
        args: function resolveArgs() {
          return arguments
        }
      }
    })
  }

  this.openAffiliate = function openAffiliate(affiliate) {
    return openModal({
      size: 'md',
      templateUrl: 'affiliateModal.html',
      controller: 'AffiliateModalController',
      resolve: {
        affiliate: function resolveAffiliate() {
          return affiliate
        }
      }
    })
  }
})


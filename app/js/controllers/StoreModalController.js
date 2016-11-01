/* globals angular, web3, _ */

angular.module('app').controller('StoreModalController', ($scope, $filter, utils, Store, AliasReg, ticker, growl, $modal, $modalInstance, store, user, helpers, constants, ISO3166, Coinage) => {

  console.log($scope)

  $scope.currencies = Object.keys(ticker.prices)
  $scope.countries = ISO3166.codeToCountry
  $scope.user = user

  $scope.disputeSecondsOptions = [
    { value: '0' },
    { value: '86400' },
    { value: '172800' },
    { value: '259200' },
    { value: '604800' },
    { value: '1209600' },
    { value: '1814400' },
    { value: '2592000' }
  ]

  $scope.disputeSecondsOptions.forEach((disputeSecondsOption) => {
    disputeSecondsOption.label = $filter('disputeSeconds')(disputeSecondsOption.value)
  })

  $scope.addApprovedAliasObject = function addApprovedAlias() {
    $scope.approvedAliasObjects.push({ alias: '' })
  }

  if (store) {

    $scope.isEditing = true
    $scope.alias = store.alias
    $scope.name = store.meta.name
    $scope.base = store.meta.base
    $scope.currency = store.currency
    $scope.bufferCentiperun = store.infosphered.data.bufferCentiperun.toNumber()
    $scope.disputeSeconds = store.infosphered.data.disputeSeconds.toString()
    $scope.info = store.meta.info
    $scope.isOpen = store.infosphered.data.isOpen
    $scope.minProductsTotal = angular.copy(store.minProductsTotal)
    $scope.affiliateFeeCentiperun = store.infosphered.data.affiliateFeeCentiperun.toNumber()
    $scope.products = angular.copy(store.products)
    $scope.transports = angular.copy(store.transports)
    $scope.submarkets = store.approvesAliases.approvedAliases.map((alias) => { return { alias } })

  } else {

    $scope.base = 'US'
    $scope.currency = user.getCurrency()
    $scope.bufferCentiperun = 0
    $scope.products = []
    $scope.disputeSeconds = '1209600'
    $scope.isOpen = true
    $scope.transports = []
    $scope.minProductsTotal = new Coinage(0, user.getCurrency())
    $scope.affiliateFeeCentiperun = 5
    $scope.submarkets = []

  }

  $scope.cancel = function cancel() {
    $modalInstance.dismiss('cancel')
  }

  $scope.addProduct = function addProduct() {
    $scope.products.push({
      units: web3.toBigNumber(1),
      imgs: [],
      isActive: true
    })

    console.log($scope.products)
  }

  $scope.addTransport = function addTransport() {
    $scope.transports.push({ isGlobal: true, to: 'US', isActive: true })
  }

  $scope.submit = function submit() {

    const alias = $scope.alias ? $scope.alias.trim().replace(/(\r\n|\n|\r)/gm, '') : ''
    const meta = {
      name: $scope.name,
      base: $scope.base,
      info: $scope.info
    }

    try {
      Store.check(alias, meta)
    } catch (e) {
      growl.addErrorMessage(e)
      return
    }

    const minProductsTeratotal = $scope.minProductsTotal.in($scope.currency).times(constants.tera)
    const affiliateFeeCentiperun = web3.toBigNumber($scope.affiliateFeeCentiperun)
    const approvedAliases = $scope.submarkets.map((submarket) => { return utils.toBytes32(submarket.alias) })

    if (store) {

      store.set({
        isOpen: $scope.isOpen,
        currency: $scope.currency,
        bufferCentiperun: web3.toBigNumber($scope.bufferCentiperun).toNumber(),
        disputeSeconds: (web3.toBigNumber($scope.disputeSeconds)).toNumber(),
        minProductsTeratotal,
        affiliateFeeCentiperun
      }, meta, $scope.products, $scope.transports, approvedAliases).then(() => {
        store.update().then(() => {
          $modalInstance.close(store)
        })
      }, (error) => {
        growl.addErrorMessage(error)
        $scope.error = error
      })

    } else {

      if (!utils.isAliasAvailable(alias)) {
        return growl.addErrorMessage(`@${alias} is already taken`)
      }

      Store
        .create(
          user.getAccount(),
          $scope.isOpen,
          $scope.currency,
          $scope.bufferCentiperun,
          $scope.disputeSeconds,
          minProductsTeratotal,
          affiliateFeeCentiperun,
          meta,
          $scope.alias,
          $scope.products,
          $scope.transports,
          approvedAliases
        )
        .then((_store) => {
          user.addStore(_store.addr)
          user.save()
          $modalInstance.close()
        }, (error) => {
          growl.addErrorMessage(error)
          $scope.error = error
        })
    }
  }
})

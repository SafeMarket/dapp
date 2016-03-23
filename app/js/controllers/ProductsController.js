/* globals angular, web3 */

angular.module('app').controller('ProductsController', ($scope, $filter, utils, Submarket, helpers, growl, user, Order, constants, Coinage) => {

  const currency = $scope.store.currency

  $scope.productsTotal = new Coinage(0, currency)
  $scope.total = new Coinage(0, currency)

  $scope.createOrder = function createOrder() {

    const buyer = user.getAccount()
    const meta = {
      products: [],
      transport: {
        id: $scope.transport.id,
        type: $scope.transport.data.type,
        price: $scope.transport.price.in(currency).toString()
      }
    }

    const storeAddr = $scope.store.addr
    const submarketAddr = $scope.submarketOption.addr
    const affiliate = utils.getAffiliate($scope.affiliateCodeOrAlias) || constants.nullAddr

    let productsTotal = web3.toBigNumber(0)

    if ($scope.affiliateCodeOrAlias && affiliate === constants.nullAddr) {
      growl.addErrorMessage(`${$scope.affiliateCodeOrAlias} is not a valid affiliate`)
      return
    }

    $scope.store.products.forEach((product) => {

      if (product.quantity === 0) {
        return true
      }

      meta.products.push({
        id: product.id,
        name: product.name,
        price: product.price.in(currency).toString(),
        quantity: product.quantity
      })

      productsTotal = productsTotal.plus(product.price.in(currency).times(product.quantity))
    })

    try {
      Order.check(buyer, storeAddr, submarketAddr, affiliate, meta)
    } catch (e) {
      growl.addErrorMessage(e)
      return
    }

    if (productsTotal.lessThan($scope.store.minTotal.in(currency))) {
      growl.addErrorMessage(`You must order at least ${$scope.store.minTotal.formattedIn(user.getCurrency())} of products`)
      return
    }

    const value = $scope.total.in('WEI').ceil()

    Order.create(buyer, storeAddr, submarketAddr, affiliate, meta, value).then((order) => {
      window.location.hash = `#/orders/${order.addr}`
      user.addOrder(order.addr)
      user.save()
    })

  }

  $scope.$watch('store.products', (products) => {

    $scope.productsTotal = new Coinage(0, currency)

    if (!products) {
      return
    }

    let productsTotal = web3.toBigNumber(0)

    products.forEach((product) => {
      const subtotal = product.price.in(currency).times(product.quantity)
      productsTotal = productsTotal.plus(subtotal)
    })

    $scope.productsTotal = new Coinage(productsTotal, currency)

  }, true)

  $scope.$watchGroup(['submarketOption', 'productsTotal', 'transport'], () => {

    if (!$scope.transport) {
      return
    }

    const fee =
      $scope.productsTotal.in(currency)
        .plus($scope.transport.price.in(currency))
        .times($scope.submarketOption.escrowFeeCentiperun)
        .div(100)

    $scope.fee = new Coinage(fee, currency)

    const total =
      $scope.productsTotal.in(currency)
        .plus($scope.transport.price.in(currency))
        .plus($scope.fee.in(currency))

    $scope.total = new Coinage(total, currency)
  })

})

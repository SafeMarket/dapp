/* globals angular, web3 */

angular.module('app').filter('currency', (utils) => {
  return function currencyFilter(amount, currencyFrom, currencyTo) {
    if (amount === undefined) {
      return undefined
    }

    if (currencyTo) {
      amount = utils.convertCurrency(amount, { from: currencyFrom, to: currencyTo })
    } else {
      currencyTo = currencyFrom
    }

    return utils.formatCurrency(amount, currencyTo, true)
  }
})

angular.module('app').filter('perun', () => {
  return function perunFilter(perun) {
    if (!isNaN(perun)) {
      perun = web3.toBigNumber(perun)
    }

    if (perun === undefined) {
      return ''
    }

    if (!perun.isFinite()) {
      return 'Infinity%'
    }

    return `${perun.times(100).toFixed(2).toString()} %`
  }
})

angular.module('app').filter('fromWei', () => {
  return function fromWeiFilter(amount, to) {
    return web3.fromWei(amount, to).toString()
  }
})

angular.module('app').filter('capitalize', () => {
  return function capitalizeFilter(input) {
    if (input === null) {
      return ''
    }

    input = input.toLowerCase()
    return input.substring(0, 1).toUpperCase() + input.substring(1)
  }
})

angular.module('app').filter('shortAddr', () => {
  return function shortAddrFilter(addr) {
    if (!addr) {
      return ''
    }

    return `${addr.substr(0, 8)}...`
  }
})

angular.module('app').filter('url', (helpers) => {
  return function urlFilter(addr, type) {
    return helpers.getUrl(type, addr)
  }
})

angular.module('app').filter('orderObjectBy', () => {
  return function orderObjectByFilter(items, field, reverse) {
    const filtered = []

    angular.forEach(items, (item) => {
      filtered.push(item)
    })

    filtered.sort((a, b) => {
      return (a[field] > b[field] ? 1 : -1)
    })

    if (reverse) {
      filtered.reverse()
    }

    return filtered
  }
})

angular.module('app').filter('reverse', () => {
  return function reverseFilter(items) {
    return items.slice().reverse()
  }
})

angular.module('app').filter('status', () => {
  return function statusFilter(status) {
    return [
      'Initialized',
      'Cancelled',
      'Shipped',
      'Finalized',
      'Disputed',
      'Resolved'
    ][status]
  }
})

angular.module('app').filter('disputeSeconds', () => {
  return function disputeSecondsFilter(disputeTime) {
    if (disputeTime === undefined) {
      return ''
    }

    disputeTime = web3.toBigNumber(disputeTime)

    if (disputeTime.equals(0)) {
      return 'No Disputes Allowed'
    }

    return `${disputeTime.div(86400).floor().toString()} Days After Shipping`
  }
})

angular.module('app').filter('alias', (utils) => {
  return function aliasFilter(addr) {
    return utils.getAlias(addr)
  }
})

angular.module('app').filter('role', (utils) => {
  return function roleFilter(role) {
    switch (role) {
      case 'buyer': return 'buyer'
      case 'storeOwner': return 'store owner'
      case 'submarketOwner': return 'submarketOwner'
      case null: return 'unknown user'
    }
  }
})

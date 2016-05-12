/* globals angular, web3, blockies*/

angular.module('app').directive('a', () => {
  return {
    link($scope, $element, $attributes) {
      $element.on('click', (e) => {
        if (!$attributes.href || $attributes.href.indexOf('#') === 0 || $attributes.href === '.') {
          return
        }

        const continueQuestion = `You are now leaving SafeMarket.
        This may be an attempt to deanonymize you. Continue?`

        if (!confirm(continueQuestion)) {
          e.preventDefault()
        }
      })
    }
  }
})

angular.module('app').directive('forum', () => {
  return {
    templateUrl: 'forum.html',
    controller: 'ForumController',
    scope: {
      forum: '='
    }
  }
})

angular.module('app').directive('comment', (user) => {
  return {
    templateUrl: 'comment.html',
    scope: {
      comment: '=',
      isRepliable: '=commentIsRepliable'
    }, link($scope) {
      $scope.isHidden = user.data.hiddenCommentIds.indexOf($scope.comment.id) !== -1

      $scope.toggleIsHidden = function toggleIsHidden() {
        if (!$scope.isHidden) {
          user.data.hiddenCommentIds.push($scope.comment.id)
        } else {
          const hiddenCommentIdIndex = user.data.hiddenCommentIds.indexOf($scope.comment.id)
          user.data.hiddenCommentIds.splice(hiddenCommentIdIndex, 1)
        }
        user.save()
        $scope.$parent.showReplies = false
        $scope.isHidden = !$scope.isHidden
      }
    }
  }
})

angular.module('app').directive('addComment', () => {
  return {
    templateUrl: 'addComment.html',
    scope: true,
    controller: 'AddCommentController',
    link($scope, $element, $attributes) {
      $scope.commentsGroup = $scope.$eval($attributes.addComment)
    }
  }
})

angular.module('app').directive('gas', (utils, user) => {
  return {
    templateUrl: 'gas.html',
    scope: {
      gas: '='
    },
    link(scope) {
      scope.$watch('gas', () => {
        scope.costInEther = web3.fromWei(web3.eth.gasPrice, 'ether').times(scope.gas)
        scope.userCurrency = user.getCurrency()
        scope.costInUserCurrency = utils.convertCurrency(scope.costInEther, {
          from: 'ETH',
          to: user.getCurrency()
        })
      })
    }
  }
})

angular.module('app').directive('amounts', (utils) => {
  return {
    templateUrl: 'amounts.html',
    scope: {
      value: '=',
      from: '=',
      to: '='
    }, link($scope) {
      $scope.amounts = {}

      $scope.$watchGroup(['value', 'from', 'to'], () => {
        if (!$scope.from || !$scope.to || $scope.value === undefined) {
          return
        }

        const value = web3.toBigNumber($scope.value)

        $scope.to.forEach((currency) => {
          $scope.amounts[currency] = utils.convertCurrency(value, {
            from: $scope.from,
            to: currency
          })
        })
      })
    }
  }
})

angular.module('app').directive('timestamp', () => {
  return {
    scope: { timestamp: '=' },
    templateUrl: 'timestamp.html',
    link: ($scope) => {
      $scope.timestampMs = 0
      $scope.$watch('timestamp', () => {
        if (!$scope.timestamp) {
          return
        }

        $scope.timestampMs = parseInt($scope.timestamp.toString(), 10) * 1000
      })
    }
  }
})

angular.module('app').directive('key', () => {
  return {
    scope: { key: '=' },
    templateUrl: 'key.html'
  }
})

angular.module('app').directive('collapsable', () => {
  return {
    scope: {
      isCollapsed: '='
    }, link(scope, element) {
      if (scope.isCollapsed) {
        element.addClass('isCollapsed')
      } else {
        element.removeClass('isCollapsed')
      }

      element.on('click', (event) => {
        if (event.target.nodeName !== 'TBODY') {
          return
        }
        element.toggleClass('isCollapsed')
      })
    }
  }
})

angular.module('app').directive('orders', () => {
  return {
    templateUrl: 'orders.html',
    controller: 'OrdersController',
    scope: { filter: '=orders' }
  }
})

angular.module('app').directive('aliasBar', () => {
  return {
    templateUrl: 'bar.html',
    controller: 'BarController',
    scope: { alias: '@aliasBar' }
  }
})

angular.module('app').directive('aliasInput', (growl) => {
  return {
    require: 'ngModel',
    link(scope, element, attr, ngModelCtrl) {
      ngModelCtrl.$parsers.push((text) => {
        const transformedInput = text.toLowerCase().replace(/[^a-z0-9]/g, '')
        if (transformedInput !== text) {
          ngModelCtrl.$setViewValue(transformedInput)
          ngModelCtrl.$render()
          growl.addErrorMessage('Aliases consist entirely of lower case letters and numbers')
        }
        return transformedInput  // or return Number(transformedInput)
      })
    }
  }
})

angular.module('app').directive('affiliateCodeInput', (growl) => {
  return {
    require: 'ngModel',
    link(scope, element, attr, ngModelCtrl) {
      ngModelCtrl.$parsers.push((text) => {
        const transformedInput = text.toLowerCase().replace(/[^a-z0-9]/g, '')
        if (transformedInput !== text) {
          ngModelCtrl.$setViewValue(transformedInput)
          ngModelCtrl.$render()
          growl.addErrorMessage('Affiliate codes are lower case letters and numbers only')
        }
        return transformedInput
      })
    }
  }
})


angular.module('app').directive('numericInput', (growl) => {
  return {
    require: 'ngModel',
    link(scope, element, attr, ngModelCtrl) {
      ngModelCtrl.$parsers.push((text) => {
        const transformedInput = text.replace(/[^0-9.]/g, '')
        if (transformedInput !== text) {
          ngModelCtrl.$setViewValue(transformedInput)
          ngModelCtrl.$render()
          growl.addErrorMessage('Numeric input only')
        }
        return transformedInput
      })
    }
  }
})

angular.module('app').directive('aliasValidator', (utils) => {
  return {
    scope: {
      alias: '=aliasValidator',
      type: '@aliasType'
    },
    link($scope) {
      $scope.$watch('alias', (alias) => {
        if ($scope.type) {
          $scope.isValid = utils.getTypeOfAlias(alias) === $scope.type
        } else {
          $scope.isValid = utils.isAliasAvailable(alias)
        }
      })
    },
    templateUrl: 'aliasValidator.html'
  }
})

angular.module('app').directive('alias', (utils, helpers) => {
  return {
    scope: {
      addr: '=alias'
    }, link($scope) {
      $scope.$watch('addr', () => {
        $scope.alias = utils.getAlias($scope.addr)
        $scope.type = utils.getTypeOfAlias($scope.alias)
        $scope.url = helpers.getUrl($scope.type, $scope.addr)

        if (!$scope.type) {
          $scope.isValid = false
        } else {
          $scope.isValid = true
        }
      })
    },
    templateUrl: 'alias.html'
  }
})

angular.module('app').directive('tabUrl', (helpers) => {
  return {
    require: '^tabset',
    link: {
      pre($scope, $element, $attributes, $controller) {
        $scope.$parent.slugs = $scope.$parent.slugs || []

        const tabIndex = $scope.$parent.slugs.length
        const args = $scope.$eval($attributes.tabUrl)
        const type = args[0]
        const addr = args[1]
        const slug = args[2]
        const url = helpers.getUrl(type, addr, slug)

        $scope.$parent.slugs.push(slug)


        if (url === window.location.hash) {
          $controller.select($scope.$parent.tabs[tabIndex])
        }

        $scope.$parent.tabs[tabIndex].onSelect = function onTabSelect() {
          window.location.hash = url
        }
      }
    }
  }
})

angular.module('app').directive('blockie', () => {
  return {
    scope: {
      seed: '='
    },
    link($scope, $element) {
      $scope.$watch('seed', (seed) => {
        const dataUrl = blockies.create({ seed, size: 8, scale: 16 }).toDataURL()
        $element[0].style.backgroundImage = `url(${dataUrl})`
      })
    }
  }
})

angular.module('app').directive('coinageInput', (Coinage) => {
  return {
    scope: { currency: '=coinageInput' },
    require: 'ngModel',
    link($scope, $element, $attributes, $model) {
      $model.$formatters.push((value) => {
        if (value) {
          return value.in($scope.currency).toString()
        }
      })
      $model.$parsers.push((value) => {
        if (value) {
          return new Coinage(value, $scope.currency)
        }
      })
      $scope.$watch('currency', (currency) => {
        if (!currency || !$model.$$rawModelValue) { return }
        $model.$setViewValue($model.$$rawModelValue.in(currency).toString())
        $model.$commitViewValue()
        $model.$render()
      })
    }
  }
})

angular.module('app').directive('bigNumberInput', () => {
  return {
    require: 'ngModel',
    link($scope, $element, $attributes, $model) {
      $model.$formatters.push((value) => {
        if (value) {
          return value.toNumber()
        }
      })
      $model.$parsers.push((value) => {
        if (value) {
          return web3.toBigNumber(value)
        }
      })
    }
  }
})

angular.module('app').directive('flag', () => {
  return {
    scope: {
      countryCode: '=flag'
    },
    templateUrl: 'flag.html'
  }
})

angular.module('app').directive('country', (ISO3166) => {
  return {
    scope: {
      countryCode: '=country'
    },
    link($scope) {
      $scope.$watch('countryCode', (countryCode) => {
        $scope.countryName = ISO3166.codeToCountry[countryCode]
      })
    },
    templateUrl: 'country.html'
  }
})

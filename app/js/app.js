"use strict";

/* global angular, web3, blockchain*/

const app = angular.module('app', [
  'ui.bootstrap',
  // 'ui.router',
  'angular-growl',
  'ngRoute',
  'yaru22.angular-timeago',
  'hc.marked',
  'ngPromiseExtras'
])

app.config((growlProvider/*, $stateProvider, $urlRouterProvider*/) => {

  growlProvider.globalTimeToLive(3000)
  growlProvider.onlyUniqueMessages(false)

  // $stateProvider
  //   .state('home', {
  //     url: '/',
  //     templateUrl: 'home.html'
  //   })
  //   .state('login', {
  //     url: '/login',
  //     templateUrl: 'login.html',
  //     controller: 'LoginController'
  //   })
  //   .state('store', {
  //     abstract: true,
  //     url: '/stores/:storeAddr',
  //     templateUrl: 'store.html',
  //     controller: 'StoreController'
  //   })
  //   .state('store.about', {
  //     url: '/about',
  //     templateUrl: 'store.about.html'
  //   })
  //   .state('store.products', {
  //     url: '/products',
  //     templateUrl: 'store.products.html'
  //   })
  //   .state('store.orders', {
  //     url: '/orders',
  //     templateUrl: 'store.orders.html'
  //   })
  //   .state('store.reviews', {
  //     url: '/reviews',
  //     templateUrl: 'store.reviews.html'
  //   })
  //   .state('submarket', {
  //     abstract: true,
  //     url: '/submarkets/:submarketAddr',
  //     templateUrl: 'submarket.html',
  //     controller: 'SubmarketController'
  //   })
  //   .state('submarket.about', {
  //     url: '/about',
  //     templateUrl: 'submarket.about.html'
  //   })
  //   .state('submarket.stores', {
  //     url: '/stores',
  //     templateUrl: 'submarket.stores.html'
  //   })
  //   .state('submarket.forum', {
  //     url: '/forum',
  //     templateUrl: 'submarket.forum.html'
  //   })
  //   .state('submarket.orders', {
  //     url: '/orders',
  //     templateUrl: 'submarket.orders.html'
  //   })
  //   .state('order', {
  //     url: '/orders/:orderAddr',
  //     templateUrl: 'order.html',
  //     controller: 'OrderController'
  //   })
  //   .state('404', {
  //     url: '/404/:alias',
  //     templateUrl: '404.html',
  //     controller: '404Controller'
  //   })
  //   .state('affiliate', {
  //     url: '/affiliate',
  //     templateUrl: 'affiliate.html',
  //     controller: 'AffiliateController'
  //   })

  //$urlRouterProvider.otherwise('/')

})

app.run((user, $rootScope, $interval, $timeout, timeAgo) => {

  // if (blockchain.env === 'development') {
  //   if (user.verifyExistence()) {
  //     user.login('password')
  //   } else {
  //     user.register('password')
  //   }
  // } else {
  //   window.location.hash = '/login'
  // }

  // function checkConnection() {
  //   $rootScope.isConnected = web3.isConnected()
  // }

  // checkConnection()

  // $interval(checkConnection, 1000)

  // timeAgo.settings.allowFuture = true

})

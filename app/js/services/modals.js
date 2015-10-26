(function(){

angular.module('app').service('modals',function($modal){
	function openModal(options){
		var modalInstance = $modal.open(options)
		modalInstance.opened.then(function(){
			window.scrollTo(0,1)
		})
		return modalInstance
	}

	this.openStore = function(store){
		return openModal({
			size: 'md'
			,templateUrl: 'storeModal.html'
			,controller: 'StoreModalController'
			,resolve: {
				store:function(){
					return store
				}
			}
		});
	}

	this.openMarket = function(market){
		return openModal({
			size: 'md'
			,templateUrl: 'marketModal.html'
			,controller: 'MarketModalController'
			,resolve: {
				market:function(){
					return market
				}
			}
		});
	}

	this.openSettings = function(){
		return openModal({
			size: 'lg'
			,templateUrl: 'settingsModal.html'
			,controller: 'SettingsModalController'
	    });
	}

	this.openAliases = function(aliasable){
		return openModal({
			size: 'lg'
			,templateUrl: 'aliasesModal.html'
			,controller: 'aliasesModalController'
			,resolve:{
				aliasable:function(){
					return aliasable
				}
			}
	    });
	}

	this.openPayment = function(addr,amount,currency){
		return openModal({
			size: 'lg'
			,templateUrl: 'paymentModal.html'
			,controller: 'PaymentModalController'
			,resolve:{
				addr:function(){
					return addr
				},amount:function(){
					return amount
				},currency:function(){
					return currency
				}
			}
	    });
	}

	this.openWithdrawl = function(order){
		return openModal({
			size: 'lg'
			,templateUrl: 'withdrawlModal.html'
			,controller: 'WithdrawlModalController'
			,resolve:{
				order:function(){
					return order
				}
			}
	    });
	}

	this.openResolution = function(order){
		return openModal({
			size: 'sm'
			,templateUrl: 'resolutionModal.html'
			,controller: 'ResolutionModalController'
			,resolve:{
				order:function(){
					return order
				}
			}
	    });
	}

	this.openImportStore = function(){
		return openModal({
			size: 'md'
			,templateUrl: 'importStoreModal.html'
			,controller: 'ImportStoreModalController'
	    });
	}

	this.openImportMarket = function(){
		return openModal({
			size: 'md'
			,templateUrl: 'importMarketModal.html'
			,controller: 'ImportMarketModalController'
	    });
	}
})


})();
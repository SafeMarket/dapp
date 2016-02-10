(function(){

angular.module('app').service('modals',function($modal){

	var modals = this

	this.currentController = null
	this.currentModalInstance = null

	function openModal(options){
		
		modals.currentController = options.controller
		modals.currentModalInstance = $modal.open(options)
		
		modals.currentModalInstance.opened.then(function(){
			window.scrollTo(0,1)
		})
		modals.currentModalInstance.result.then(function(){
			modals.currentController = null
			modals.currentModalInstance = null
		})
		
		return modals.currentModalInstance
	}

	this.closeInstance = function(){
		if(this.currentModalInstance)
			this.currentModalInstance.dismiss()
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

	this.openSubmarket = function(submarket){
		return openModal({
			size: 'md'
			,templateUrl: 'submarketModal.html'
			,controller: 'SubmarketModalController'
			,resolve: {
				submarket:function(){
					return submarket
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

	this.openImportSubmarket = function(){
		return openModal({
			size: 'md'
			,templateUrl: 'importSubmarketModal.html'
			,controller: 'ImportSubmarketModalController'
	    });
	}

	this.openLeaveReview = function(order){
		return openModal({
			size: 'md'
			,templateUrl: 'leaveReviewModal.html'
			,controller: 'LeaveReviewModalController'
			,resolve:{
				order:function(){
					return order
				}
			}
	    });
	}

	this.openTxMonitor = function(){
		return openModal({
			size: 'md'
			,templateUrl: 'txMonitorModal.html'
			,controller: 'txMonitorModalController'
			,resolve:{
				args:function(){
					return arguments
				}
			}
	    });
	}

	this.openAffiliate = function(affiliate){
		return openModal({
			size: 'md'
			,templateUrl: 'affiliateModal.html'
			,controller: 'AffiliateModalController'
			,resolve:{
				affiliate:function(){
					return affiliate
				}
			}
	    });
	}
})


})();
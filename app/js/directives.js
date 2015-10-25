(function(){

angular.module('app').directive('forum',function(){
	return {
		templateUrl:'forum.html'
		,controller:'ForumController'
		,scope:{
			forum:'='
		}
	}
})

angular.module('app').directive('addComment',function(){
	return {
		templateUrl:'addComment.html'
		,scope:false
		,link:function($scope,$element,$attributes){

			var commentsGroup = $scope.$eval($attributes.addComment)

			$scope.$watch('text',function(text){
				$scope.estimatedGas = !text?0:$scope.forum.contract.addComment.estimateGas(0,text)
			})

			$scope.addComment = function(){
				$scope.isAddingComment = true
				commentsGroup.addComment(commentsGroup.id,$scope.text).then(function(){
					commentsGroup.update().then(function(){
						$scope.text = null
						$scope.isAddingComment = false
					})
				})
			}
		}
	}
})

angular.module('app').directive('gas',function(safemarket,user){
	return {
		templateUrl:'gas.html'
		,scope:{
			gas:'='
		},link:function(scope,element,attributes){
			scope.$watch('gas',function(){
				scope.costInEther = web3.fromWei(web3.eth.gasPrice,'ether').times(scope.gas)
				scope.userCurrency = user.data.currency
				scope.costInUserCurrency = safemarket.utils.convertCurrency(scope.costInEther,{from:'ETH',to:user.data.currency})
			})
		}
	}
})

angular.module('app').directive('amounts',function(utils){
	return {
		templateUrl:'amounts.html'
		,scope:{
			value:'='
			,from:'='
			,to:'='
		},link:function($scope){
			$scope.amounts = {}

			$scope.$watchGroup(["value","from","to"],function(){
				if(typeof $scope.value === 'string' || typeof $scope.value === 'number')
					var value = new BigNumber($scope.value)
				else
					var value = angular.copy($scope.value)

				if(!$scope.from || !$scope.to || value===undefined) return
				$scope.to.forEach(function(currency){
					$scope.amounts[currency] = utils.convertCurrency(value,{from:$scope.from,to:currency})
				})
			})
		}
	}
})

angular.module('app').directive('timestamp',function(){
	return {
		scope:{timestamp:'='}
		,templateUrl:'timestamp.html'
	}
})

angular.module('app').directive('key',function(){
	return {
		scope:{key:'='}
		,templateUrl:'key.html'
	}
})

angular.module('app').directive('collapsable',function(){
	return {
		scope:{
			"isCollapsed":"="
		},link:function(scope,element,attributes){
			if(scope.isCollapsed)
				element.addClass('isCollapsed')
			else
				element.removeClass('isCollapsed')

			element.on('click',function(event){
				if(event.target.nodeName!=='TBODY') return
				element.toggleClass('isCollapsed')
			})
		}
	}
})

angular.module('app').directive('aliasBar',function(){
	return {
		templateUrl:'bar.html'
		,controller:'BarController'
		,scope:{alias:'@aliasBar'}
	}
})

angular.module('app').directive('aliasInput', function(growl) {
  	return {
    	require: 'ngModel',
    	link: function (scope, element, attr, ngModelCtrl) {
      		ngModelCtrl.$parsers.push(function(text) {
        		var transformedInput = text.toLowerCase().replace(/[^a-z]/g, '');
        		if(transformedInput !== text) {
           			ngModelCtrl.$setViewValue(transformedInput);
            		ngModelCtrl.$render();
            		growl.addErrorMessage('Aliases consist entirely of lower case letters')
        		}
        		return transformedInput;  // or return Number(transformedInput)
      		});
    	}
  	}; 
});

angular.module('app').directive('numericInput', function(growl) {
	return {
        require: 'ngModel',
        link: function (scope, element, attr, ngModelCtrl) {  
        	ngModelCtrl.$parsers.push(function(text) {
        		var transformedInput = text.replace(/[^0-9.]/g, "");
        		if(transformedInput !== text) {
           			ngModelCtrl.$setViewValue(transformedInput);
            		ngModelCtrl.$render();
            		growl.addErrorMessage('Numeric input only')
        		}
        		return transformedInput;  // or return Number(transformedInput)
      		});         
        }
    };
});

angular.module('app').directive('aliasValidator', function(safemarket) {
  	return {
  		scope:{
  			alias:'=aliasValidator'
  			,type:'@aliasType'
  		},link: function ($scope) {
      		$scope.$watch('alias',function(alias){
      			if($scope.type)
      				$scope.isValid = safemarket.utils.getTypeOfAlias(alias) === $scope.type
      			else
      				$scope.isValid = safemarket.utils.isAliasAvailable(alias)
      		})
    	},templateUrl:'aliasValidator.html'
  	}; 
});

angular.module('app').directive('alias', function(safemarket,helpers) {
  	return {
  		scope:{
  			addr:'=alias'
  		},link: function ($scope) {
  			$scope.$watch('addr',function(){
	      		$scope.alias = safemarket.utils.getAlias($scope.addr)
	      		$scope.type = safemarket.utils.getTypeOfAlias($scope.alias)
	      		$scope.url = helpers.getUrl($scope.type,$scope.addr)
  			
	      		if(!$scope.type)
	      			$scope.isValid = false
	      		else
	      			$scope.isValid = true
  			})
    	},templateUrl:'alias.html'
  	}; 
});

})();
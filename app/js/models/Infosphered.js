angular.module('app').factory('Infosphered',function(utils){
	
	function Infosphered(contract,types){
		this.contract = contract
		this.types = types
	}

	Infosphered.prototype.getMartyrCalls = function(data){
		
		var infosphered = this
			,newData = {}
			,calls = []
		
		Object.keys(data).forEach(function(key){

			var newValue = data[key]
				,currentValue = infosphered.getValue(key)
				,type = infosphered.types[key]

			if(newValue == currentValue)
				return true

			if(typeof currentValue === 'string' && utils.toAscii(currentValue) == newValue)
				return true

			if(currentValue.equals && currentValue.equals(newValue))
				return true

			calls.push({
				address:infosphered.contract.address
				,data:infosphered.contract[getInfospheredSetterName(type)].getData(key,newValue)
			})

		})

		return calls

	}

	function getInfospheredSetterName(type){
		return 'set'+type.charAt(0).toUpperCase() + type.slice(1)
	}

	function getInfospheredGetterName(type){
		return 'get'+type.charAt(0).toUpperCase() + type.slice(1)
	}

	
	Infosphered.prototype.getValue = function(key){
		var type = this.types[key]
		
		if(!type)
			throw key+' has no associate type'

		var functionName = getInfospheredGetterName(type)

		return this.contract[functionName](key)
	}

	Infosphered.prototype.update = function(){
		
		var infosphered = this
			,data = {}

		Object.keys(this.types).forEach(function(key){
			data[key] = infosphered.getValue(key)
		})

		this.data = data
	}


	return Infosphered
});
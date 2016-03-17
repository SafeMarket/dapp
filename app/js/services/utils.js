angular.module('app').service('utils',function(ticker,$q,$timeout,AliasReg,AffiliateReg,constants){

	var utils = this
		,compileJson = Module.cwrap("compileJSON", "string", ["string", "number"])

	function sanitize(string){
		return string.split('&').join('&amp;').split('<').join('&lt;').split('>').join('&gt;');
	}

	function isAddr(string){
		try{
			return cryptocoin.convertHex.hexToBytes(string).length===20
		}catch(e){
			return false
		}
	}

	function isAliasAvailable(alias){
		return AliasReg.getAddr(alias) === constants.nullAddr
	}

	function getTypeOfAlias(alias){

		var addr = AliasReg.getAddr(alias)
		return getTypeOfAddr(addr)
		
	}

	function getTypeOfAddr(addr){

		if(addr === constants.nullAddr)
			return null

		var runtimeBytecode = web3.eth.getCode(addr)

		if(runtimeBytecode === '0x')
			return 'user'

		if(runtimeBytecode === utils.runtimeBytecodes.Store)
			return 'store'

		if(runtimeBytecode === utils.runtimeBytecodes.Submarket)
			return 'submarket'

		return null
	}

	function getContract(addr){
		var contract = null
		Object.keys(utils.runtimeBytecodes).forEach(function(contractName){
			var runtimeBytecode = utils.runtimeBytecodes[contractName]
			if(web3.eth.getCode(addr)===runtimeBytecode){
				contract = web3.eth.contract(contractDB[contractName].compiled.info.abiDefinition).at(addr)
				return false
			}
		})
		return contract
	}

	function validateAlias(alias,contractName){
		return validateAddr(AliasReg.getAddr(alias),contractName)
	}

	function validateAddr(addr,contractName){
		return web3.eth.getCode(addr)===utils.runtimeBytecodes[contractName]
	}
	

	function toAscii(string){
		var zeroChar = String.fromCharCode(0)
		return web3.toAscii(string).split(zeroChar).join('')
	}

	function getAlias(addr){
		return toAscii(AliasReg.getAlias(addr))
	}

	function convertObjectToHex(object){
		var objectBytes = msgpack.pack(object);
		return '0x'+cryptocoin.convertHex.bytesToHex(objectBytes)
	}

	function convertHexToObject(hex){
		try{
			var objectBytes = cryptocoin.convertHex.hexToBytes(hex)
			return msgpack.unpack(objectBytes)
		}catch(e){
			return null
		}
	}

	function convertCurrency(amount,currencies){

		if(currencies.from === currencies.to)
			return web3.toBigNumber(amount)

		if(typeof amount!=='string')
			amount = amount.toString()

		check({
			amount:amount
			,from:currencies.from
			,to:currencies.to
		},{
			amount:{presence:true,type:'string',numericality:{}}
			,from:{presence:true,inclusion:Object.keys(ticker.rates),type:'string'}
			,to:{presence:true,inclusion:Object.keys(ticker.rates),type:'string'}
		})

		amount = 
			(web3.toBigNumber(amount))
				.div(ticker.rates[currencies.from])
				.times(ticker.rates[currencies.to])

		if(currencies.to === 'WEI')
			amount = amount.ceil()

		return amount
	}

	function formatCurrency(amount,currency,doPrefix){

		if(doPrefix)
			var prefix = ' '+currency
		else
			var prefix = ''

		amount = web3.toBigNumber(amount || 0)

		if(currency === 'ETH')
			return amount.toFixed(6)+prefix
		else
			return amount.toFixed(2)+prefix
	}

	function convertCurrencyAndFormat(amount,currencies){
		return formatCurrency(
			convertCurrency(amount,currencies)
			,currencies.to
		)
	}


	function send(address,value){
		var deferred = $q.defer()
			,txHex = web3.eth.sendTransaction({
				to:address
				,value:value
			})

		waitForTx(txHex).then(function(){
			deferred.resolve()
		})

		return deferred.promise
	}

	function waitForTx(txHex, duration, pause){

		var deferred = $q.defer()
			,duration = duration ? duration : (1000*60)
			,pause = pause ? pause : (1000*3)
			,timeStart = Date.now()
			,interval = setInterval(function(){

				var tx = web3.eth.getTransactionReceipt(txHex)

				if(tx){
					clearInterval(interval)
					deferred.resolve(tx)
				}

				if(Date.now() - timeStart > duration){
					clearInterval(interval)
					deferred.reject('Transaction not found after '+duration+'ms')
				}

			},pause)

		return deferred.promise

	}

	function waitForTxs(txHexes){
		var deferred = $q.defer()
			,completedCount = 0

		if(txHexes.length === 0)
			$timeout(function(){
				deferred.reject('No transactions to wait for')
			},1)

		txHexes.forEach(function(txHex){
			waitForTx(txHex)
				.then(function(){
					completedCount++
					if(completedCount===txHexes.length)
						deferred.resolve()
				},function(error){
					deferred.reject(error)
				}).catch(function(error){
					deferred.reject(error)
				})
		})

		return deferred.promise
	}

	function check(data,constraints,prefix){

		if(!data)
			throw 'data is not an object'
			
		var dataKeys = Object.keys(data)
		    ,constraintKeys = Object.keys(constraints)

		constraintKeys.forEach(function(key){
			if(!constraints[key].type)
				throw key+' must be constrained by type'
		})

		dataKeys.forEach(function(key){
		    if(constraintKeys.indexOf(key)===-1)
			    delete data[key]
		})  

		var errors = validate(data,constraints)

		if(errors===undefined || errors===null)
			return null

		var error = errors[Object.keys(errors)[0]][0]

		error = prefix ? prefix+' '+error : error

	    throw error
	}

	function getContractAddressFromTxReceipt(txReciept){
		return '0x'+txReciept.logs[txReciept.logs.length-1].data.substr(-40)
	}

	function getAliasedMartyrCalls(address,alias){
		return [
			{
				address:address
				,data:getCallData('setAlias',["bytes32"],[alias])
			}
		]
	}

	function getCallData(funcName,types,values){
		var callDataBytes = abi.rawEncode(funcName,types,values)
		return '0x'+cryptocoin.convertHex.bytesToHex(new Uint8Array(callDataBytes))
	}

	function getMartyrData(calls){

		var callCodes = []

		calls.forEach(function(call,index){
			if(!call.address)
				throw 'Call object needs an address'

			if(!call.data)
				throw 'Call object needs data'

			var splitterRegex = (call.data.length %2 == 0) ? /(?=(?:..)*$)/ : /(?=(?:..)*.$)/
				,byteString = '\\x'+dehexify(call.data).split(splitterRegex).join('\\x')
				,saveAs = call.saveAs ? call.saveAs +' = ' : ''

			callCodes.push('temp = "'+byteString+'";')
			callCodes.push(saveAs+'address('+call.address+').call(temp);')

		})

		var solCode = 'contract Martyr{\r\nfunction Martyr(){ bytes memory temp; \r\n'+callCodes.join('\r\n')+'\r\n}\r\n}'

		var data = (JSON.parse(compileJson(solCode))).contracts.Martyr


		return hexify(data.bytecode)
	}

	function getFunctionHash(name,types){
		return web3.sha3(name+'('+types.join(',')+')').slice(0,8)
	}

	function hexify(string){
		if(string.indexOf('0x')===0)
			return string
		else
			return '0x'+string
	}

	function dehexify(string){
		if(string.indexOf('0x')===0)
			return string.slice(2)
		else
			return string
	}

	function getRandom(){
		return web3.toBigNumber(Math.random())
	}

	function getAffiliate(affiliateCodeOrAlias){
		var affiliate = null

		if(!affiliateCodeOrAlias)
			return affiliate

		if(affiliateCodeOrAlias.charAt(0)==='@')
			affiliate = AliasReg.getAddr(affiliateCodeOrAlias)
		else
			affiliate = AffiliateReg.getAffiliateParams(affiliateCodeOrAlias)[1]

		if(affiliate===constants.nullAddr)
			return null
		else
			return affiliate
	}

	angular.merge(this,{
		sanitize:sanitize
		,convertObjectToHex:convertObjectToHex
		,convertHexToObject:convertHexToObject
		,convertCurrency:convertCurrency
		,formatCurrency:formatCurrency
		,convertCurrencyAndFormat:convertCurrencyAndFormat
		,waitForTx:waitForTx
		,waitForTxs:waitForTxs
		,check:check
		,isAddr:isAddr
		,getAlias:getAlias
		,toAscii:toAscii
		,isAliasAvailable:isAliasAvailable
		,send:send
		,getTypeOfAlias:getTypeOfAlias
		,getTypeOfAddr:getTypeOfAddr
		,runtimeBytecodes:{
			Store: contracts.Store.runtimeBytecode
			,Submarket: contracts.Submarket.runtimeBytecode
		},validateAddr:validateAddr
		,validateAlias:validateAlias
		,getContract:getContract
		,getContractAddressFromTxReceipt:getContractAddressFromTxReceipt
		,compileJson: compileJson
		,getFunctionHash:getFunctionHash
		,getMartyrData:getMartyrData
		,hexify:hexify
		,dehexify:dehexify
		,getAliasedMartyrCalls:getAliasedMartyrCalls
		,getRandom:getRandom
		,getAffiliate:getAffiliate
	})
	
});
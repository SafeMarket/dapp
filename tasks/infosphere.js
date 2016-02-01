module.exports = function(grunt){
	var fs = require('fs')
		,solc = require('solc')

	grunt.registerTask("infosphere", "Create infosphere contract", function(){
		var infosphereSol = 'contract Infosphere{\r\n'
			,infospheredSol =
				'contract infosphered is owned{'
				+'\r\n'
				+'\r\n    Infosphere infosphere;'
				+'\r\n'

		var types = ['bool','address','bytes','string','int','uint']

		for(var i = 1; i<=32; i++){
			//types.push('bytes'+i)
		}

		for(var i = 8; i<=256; i=i+8){
			// types.push('uint'+i)
			// types.push('int'+i)
		}

		types.forEach(function(type){
			var typeStore = type+'Store'
				,typeUpperCaseFirstLetter = type.charAt(0).toUpperCase() + type.slice(1) //upercase first letter

			infosphereSol+='\r\n    // ================ '+type+' ================'
			infosphereSol+='\r\n'
			infosphereSol+='\r\n    mapping(address=>mapping(bytes=>'+type+')) '+typeStore+';'
			infosphereSol+='\r\n'
			infosphereSol+='\r\n    function get'+typeUpperCaseFirstLetter+'(address addr, bytes key) constant returns('+type+'){'
			infosphereSol+='\r\n        return '+typeStore+'[addr][key];'
			infosphereSol+='\r\n    }'
			infosphereSol+='\r\n'
			infosphereSol+='\r\n    function getMy'+typeUpperCaseFirstLetter+'(bytes key) constant returns('+type+'){'
			infosphereSol+='\r\n        return '+typeStore+'[msg.sender][key];'
			infosphereSol+='\r\n    }'
			infosphereSol+='\r\n'
			infosphereSol+='\r\n    function set'+typeUpperCaseFirstLetter+'(bytes key, '+type+' value){'
			infosphereSol+='\r\n        '+typeStore+'[msg.sender][key] = value;'
			infosphereSol+='\r\n    }'
			infosphereSol+='\r\n'

			infospheredSol+='\r\n    // ================ '+type+' ================'
			infospheredSol+='\r\n'
			infospheredSol+='\r\n    function set'+typeUpperCaseFirstLetter+'(bytes key, '+type+' value) external{'
			infospheredSol+='\r\n        this.requireOwnership();'
			infospheredSol+='\r\n        infosphere.set'+typeUpperCaseFirstLetter+'(key,value);'
			infospheredSol+='\r\n    }'
			infospheredSol+='\r\n'
			infospheredSol+='\r\n    function set'+typeUpperCaseFirstLetter+'(bytes key, '+type+' value) internal{'
			infospheredSol+='\r\n        infosphere.set'+typeUpperCaseFirstLetter+'(key,value);'
			infospheredSol+='\r\n    }'
			infospheredSol+='\r\n'
		})

		infosphereSol+='}'
		infospheredSol+='}'

		var ownedSol = fs.readFileSync('app/contracts/0/owned.sol')
			,solcOutput = solc.compile(ownedSol+'\r\n\ \r\n\ '+infosphereSol+'\r\n\ \r\n\ '+infospheredSol,1)

		if(solcOutput.errors && solcOutput.errors.length>0){
			grunt.log.error(solcOutput.errors[0])
			return false
		}else{
			fs.writeFileSync('app/contracts/0/Infosphere.sol',infosphereSol)
			fs.writeFileSync('app/contracts/1/infosphered.sol',infospheredSol)
			grunt.log.success('Created Infosphere.sol and infosphered.sol')
		}


	})
}
module.exports = function(grunt){
	var fs = require('fs')
		,solc = require('solc')

	grunt.registerTask("infosphere", "Create infosphere contract", function(){
		var infosphereSol = 'contract Infosphere{\r\n'

		var types = ['bool','address','bytes','string','int','uint']

		for(var i = 1; i<=32; i++){
			types.push('bytes'+i)
		}

		for(var i = 8; i<=256; i=i+8){
//			types.push('uint'+i)
//			types.push('int'+i)
		}

		types.forEach(function(type){
			var typeStore = type+'_store'

			infosphereSol+='\r\n    // ================ '+type+' ================'
			infosphereSol+='\r\n'
			infosphereSol+='\r\n    mapping(address=>mapping(bytes=>'+type+')) '+typeStore+';'
			infosphereSol+='\r\n'
			infosphereSol+='\r\n    function get_'+type+'_value(address addr, bytes key) constant returns('+type+'){'
			infosphereSol+='\r\n        return '+typeStore+'[addr][key];'
			infosphereSol+='\r\n    }'
			infosphereSol+='\r\n'
			infosphereSol+='\r\n    function set_'+type+'_value(bytes key, '+type+' value){'
			infosphereSol+='\r\n        '+typeStore+'[msg.sender][key] = value;'
			infosphereSol+='\r\n    }'
			infosphereSol+='\r\n'
		})

		infosphereSol+='}'

		fs.writeFileSync('app/contracts/Infosphere.sol',infosphereSol)

		var solcOutput = solc.compile({
			sources:{'Infosphere.sol':infosphereSol}
		},1)

		if(solcOutput.errors && solcOutput.errors.length>0){
			grunt.log.error(solcOutput.errors[0])
			return false
		}


	})
}
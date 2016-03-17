angular.module('app').service('constants',function(){
	this.tera = web3.toBigNumber('1000000000000')
	this.nullAddr = '0x'+Array(21).join('00')
});
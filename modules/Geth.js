module.exports = Geth

var cp = require('child_process')
	,q = require('q')
	,fs = require('fs')

function Geth(bin,flags){

	if(flags && !Array.isArray(flags))
		throw 'Flags must be an array'


	this.bin = bin || 'geth'
	this.flags = flags || []
}

Geth.prototype.run = function(cmd,onStdout,onStderr){

	if(cmd && !Array.isArray(cmd))
		throw 'cmd must be an array'

	var args = this.flags.concat(cmd)

	this.proc = cp.spawn(this.bin,args)

	this.proc.stdout.on("data", function(data){

		process.stdout.write(data.toString())
		if(!onStdout) return

		var args = [data.toString()].concat(Array.prototype.slice(arguments))
		onStdout.apply(this,args)
	});

	this.proc.stderr.on("data", function(data){
		process.stdout.write(data.toString())
		if(!onStderr) return

		var args = [data.toString()].concat(Array.prototype.slice(arguments))
		onStderr.apply(this,args)
	});
}

Geth.prototype.startRpc = function(){
	var deferred = q.defer()

	this.run(['--rpc'],function(data){
		if(data.indexOf('Fatal')>-1)
			deferred.reject(data)
	},function(data){
		if(data.indexOf('imported')>-1)
			deferred.resolve()

	})

	return deferred.promise
}

Geth.prototype.kill = function(){
	this.proc.kill()
}
module.exports = Geth

var cp = require('child_process')
	,q = require('q')
	,fs = require('fs')

function Geth(bin,flags,passwordFilePath){

	if(flags && !Array.isArray(flags))
		throw 'Flags must be an array'


	this.bin = bin || 'geth'
	this.flags = flags || []
	this.passwordFilePath = passwordFilePath || '.geth-password'
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

Geth.prototype.getAccounts = function(){
	var deferred = q.defer()
		,geth = this
		,accounts = []

	this.run(['account','list'],function(data){
		if(data.indexOf('Fatal')>-1)
			return deferred.resolve(accounts)
		
		var lines = data.match(/[^\r\n]+/g)

		lines.forEach(function(line){
			if(line) accounts.push(parseAccountString(line))
		})
	})

	this.proc.stdout.on('end',function(){
		deferred.resolve(accounts)
	})

	return deferred.promise
}

Geth.prototype.createPasswordFile = function(password){
	this.deletePasswordFile()
	fs.writeFileSync(this.passwordFilePath,password)
}

Geth.prototype.deletePasswordFile = function(password){
	if(fs.existsSync(this.passwordFilePath))
		fs.unlinkSync(this.passwordFilePath)
}


Geth.prototype.createAccount = function(password){
	var deferred = q.defer()
		,geth = this

	this.createPasswordFile(password)

	this.run(['--password',this.passwordFilePath,'account','new'],function(data){
		geth.deletePasswordFile()
		deferred.resolve(parseAccountString(data))
	})

	return deferred.promise
}

Geth.prototype.startRpc = function(account,password){
	var deferred = q.defer()
		,geth = this

	this.createPasswordFile(password)

	this.run(['--password',this.passwordFilePath,'--unlock',account,'--rpc'],function(data){
		geth.deletePasswordFile()

		if(data.indexOf('Fatal')>-1)
			deferred.reject(data)
	},function(data){
		if(data.indexOf('imported')>-1)
			deferred.resolve()

	})

	return deferred.promise
}

Geth.prototype.createAccountIfNoneExists = function(password){
	var deferred = q.defer()
		,geth = this

	this.getAccounts().then(function(accounts){
		if(accounts.length>0)
			deferred.resolve()
		else
			geth.createAccount(password).then(function(){
				deferred.resolve()
			})
	})

	return deferred.promise
}

Geth.prototype.quickstart = function(password){
	var deferred = q.defer()
		,geth = this

	this.createAccountIfNoneExists(password).then(function(){
		geth.startRpc(0,password).then(deferred.resolve,deferred.reject)
	})

	return deferred.promise
}

Geth.prototype.kill = function(){
	this.proc.kill()
}

function parseAccountString(string){
	return string.split('{')[1].split('}')[0]
}

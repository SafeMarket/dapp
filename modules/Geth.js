module.exports = Geth

const cp = require('child_process')
const q = require('q')
const fs = require('fs')

function Geth(bin, flags) {

  if (!fs.existsSync(bin)) {
    throw new Error(`${bin} does not exist`)
  }

  if (flags && !Array.isArray(flags)) {
    throw new Error('Flags must be an array')
  }

  this.bin = bin || 'geth'
  this.flags = flags || []
}

Geth.prototype.run = function runGeth(cmd, onStdout, onStderr) {

  if (cmd && !Array.isArray(cmd)) {
    throw new Error('cmd must be an array')
  }

  const args = this.flags.concat(cmd)

  this.proc = cp.spawn(this.bin, args)

  this.proc.stdout.on('data', (data) => {

    process.stdout.write(data.toString())
    if (!onStdout) { return }

    const _args = [data.toString()].concat(Array.prototype.slice(arguments))
    onStdout.apply(this, _args)
  })

  this.proc.stderr.on('data', (data) => {
    process.stdout.write(data.toString())
    if (!onStderr) { return }

    const _args = [data.toString()].concat(Array.prototype.slice(arguments))
    onStderr.apply(this, _args)
  })
}

Geth.prototype.startRpc = function startGethRpc() {
  const deferred = q.defer()

  this.run(['--rpc', '--fast'], (data) => {
    if (data.indexOf('Fatal') > -1) {
      deferred.reject(data)
    }
  }, (data) => {
    if (data.indexOf('imported') > -1) {
      deferred.resolve()
    }
  })

  return deferred.promise
}

Geth.prototype.kill = function killGeth() {

  const deferred = q.defer()

  this.proc.on('exit', () => {
    deferred.resolve()
  })

  this.proc.kill()

  return deferred.promise
}

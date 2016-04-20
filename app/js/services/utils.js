/* globals angular, Module, cryptocoin, web3, contracts, msgpack, abi, validate, nacl */

angular.module('app').service('utils', function utilsService(ticker, $q, $timeout, AliasReg, AffiliateReg, constants) {

  const utils = this


  function sanitize(string) {
    return string.split('&').join('&amp;').split('<').join('&lt;').split('>').join('&gt;')
  }

  function hexify(string) {
    if (string.indexOf('0x') === 0) {
      return string
    }
    return `0x${string}`
  }

  function dehexify(string) {
    if (string.indexOf('0x') === 0) {
      return string.slice(2)
    }
    return string
  }

  function isAddr(string) {
    try {
      return cryptocoin.convertHex.hexToBytes(string).length === 20
    } catch (e) {
      return false
    }
  }

  function isAliasAvailable(alias) {
    return AliasReg.getAddr(alias) === constants.nullAddr
  }

  function getTypeOfAddr(addr) {

    if (addr === constants.nullAddr) {
      return null
    }

    const runtimeBytecode = web3.eth.getCode(addr)

    if (runtimeBytecode === '0x') {
      return 'user'
    }

    if (runtimeBytecode === utils.runtimeBytecodes.Store) {
      return 'store'
    }

    if (runtimeBytecode === utils.runtimeBytecodes.Submarket) {
      return 'submarket'
    }

    return null
  }

  function getTypeOfAlias(alias) {
    return getTypeOfAddr(AliasReg.getAddr(alias))
  }

  function getContract(addr) {
    let contract = null

    Object.keys(utils.runtimeBytecodes).forEach((contractName) => {
      const runtimeBytecode = utils.runtimeBytecodes[contractName]
      if (web3.eth.getCode(addr) === runtimeBytecode) {
        contract = web3.eth.contract(contracts[contractName].abi).at(addr)
        return false
      }
    })
    return contract
  }

  function validateAddr(addr, contractName) {
    return web3.eth.getCode(addr) === utils.runtimeBytecodes[contractName]
  }

  function validateAlias(alias, contractName) {
    return validateAddr(AliasReg.getAddr(alias), contractName)
  }

  function toAscii(string) {
    return web3.toAscii(string).split(String.fromCharCode(0)).join('')
  }

  function getAlias(addr) {
    return toAscii(AliasReg.getAlias(addr))
  }

  function convertObjectToHex(object) {
    return convertBytesToHex(convertObjectToBytes(object))
  }

  function convertObjectToBytes(object) {
    return msgpack.pack(object)
  }

  function convertBytesToObject(bytes) {
    return msgpack.unpack(bytes)
  }

  function convertBytesToHex(bytes) {
    return hexify(cryptocoin.convertHex.bytesToHex(bytes))
  }

  function convertHexToObject(hex) {
    try {
      return msgpack.unpack(convertHexToBytes(hex))
    } catch (e) {
      return null
    }
  }

  function convertHexToBytes(hex) {
    return cryptocoin.convertHex.hexToBytes(hex)
  }

  function convertCurrency(amount, currencies) {

    if (currencies.from === currencies.to) {
      return web3.toBigNumber(amount)
    }

    if (typeof amount !== 'string') {
      amount = amount.toString()
    }

    check({
      amount: amount,
      from: currencies.from,
      to: currencies.to
    }, {
      amount: { presence: true, type: 'string', numericality: {} },
      from: { presence: true, inclusion: Object.keys(ticker.rates), type: 'string' },
      to: { presence: true, inclusion: Object.keys(ticker.rates), type: 'string' }
    })

    amount =
      web3.toBigNumber(amount)
        .div(ticker.rates[currencies.from])
        .times(ticker.rates[currencies.to])

    if (currencies.to === 'WEI') {
      amount = amount.ceil()
    }

    return amount
  }

  function formatCurrency(amount, currency, doPrefix) {

    const prefix = doPrefix ? ` ${currency}` : ''
    const places = currency === 'ETH' ? 6 : 2

    return amount.toFixed(places).toString() + prefix

  }

  function convertCurrencyAndFormat(amount, currencies) {
    return formatCurrency(
      convertCurrency(amount, currencies),
      currencies.to
    )
  }

  function send(address, value) {
    const deferred = $q.defer()
    const txHex = web3.eth.sendTransaction({
      to: address,
      value: value
    })

    waitForTx(txHex).then(() => {
      deferred.resolve()
    })

    return deferred.promise
  }

  function waitForTx(txHex, duration, pause) {

    duration = duration || 1000 * 60
    pause = pause || 1000 * 3

    const deferred = $q.defer()
    const timeStart = Date.now()
    const interval = setInterval(() => {

      const tx = web3.eth.getTransactionReceipt(txHex)

      if (tx) {
        clearInterval(interval)
        deferred.resolve(tx)
      }

      if (Date.now() - timeStart > duration) {
        clearInterval(interval)
        deferred.reject(`Transaction not found after ${duration}ms`)
      }

    }, pause)

    return deferred.promise

  }

  function waitForTxs(txHexes) {
    const deferred = $q.defer()
    let completedCount = 0

    if (txHexes.length === 0) {
      $timeout(() => {
        deferred.reject(new Error('No transactions to wait for'))
      }, 1)
    }

    txHexes.forEach((txHex) => {
      waitForTx(txHex)
        .then(() => {
          completedCount++
          if (completedCount === txHexes.length) {
            deferred.resolve()
          }
        }, (err) => {
          deferred.reject(err)
        })
    })

    return deferred.promise
  }

  function check(data, constraints, prefix) {

    if (!data) {
      throw new Error('data is not an object')
    }

    const dataKeys = Object.keys(data)
    const constraintKeys = Object.keys(constraints)

    constraintKeys.forEach((key) => {
      if (!constraints[key].type) {
        throw new Error(`${key} must be constrained by type`)
      }
    })

    dataKeys.forEach((key) => {
      if (constraintKeys.indexOf(key) === -1) {
        delete data[key]
      }
    })

    const errors = validate(data, constraints)

    if (errors === undefined || errors === null) {
      return null
    }

    const error = errors[Object.keys(errors)[0]][0]

    throw new Error(prefix ? `${prefix} ${error}` : error)
  }

  function getContractAddressFromTxReceipt(txReciept) {
    return hexify(txReciept.logs[txReciept.logs.length - 1].data.substr(-40))
  }

  function getAliasedMartyrCalls(address, alias) {
    return [
      {
        address: address,
        data: getCallData('setAlias', ['bytes32'], [alias])
      }
    ]
  }

  function getCallData(funcName, types, values) {
    const callDataBytes = abi.rawEncode(funcName, types, values)
    return hexify(cryptocoin.convertHex.bytesToHex(new Uint8Array(callDataBytes)))
  }

  function getMartyrData(calls) {

    const callCodes = []

    calls.forEach((call) => {
      if (!call.address) {
        throw new Error('Call object needs an address')
      }

      if (!call.data) {
        throw new Error('Call object needs data')
      }

      const splitterRegex = (call.data.length % 2 === 0) ? /(?=(?:..)*$)/ : /(?=(?:..)*.$)/
      let byteString = dehexify(call.data).split(splitterRegex).join('\\x')
      byteString = `\\x${byteString}`
      const saveAs = call.saveAs ? `${call.saveAs} = ` : ''

      callCodes.push(`temp = "${byteString}";`)
      callCodes.push(`${saveAs}address(${call.address}).call(temp);`)

    })

    const solCode = `contract Martyr{\r\nfunction Martyr() { bytes memory temp; \r\n${callCodes.join('\r\n')}\r\n}\r\n}`

    console.log(solCode)

    const bytecode = web3.eth.compile.solidity(solCode).Martyr.code

    return hexify(bytecode)
  }

  function getFunctionHash(name, types) {
    return web3.sha3(`${name}(${types.join(',')})`).slice(0, 8)
  }

  function getRandom() {
    return web3.toBigNumber(Math.random())
  }

  function getAffiliate(affiliateCodeOrAlias) {
    let affiliate = null

    if (!affiliateCodeOrAlias) {
      return affiliate
    }

    if (affiliateCodeOrAlias.charAt(0) === '@') {
      affiliate = AliasReg.getAddr(affiliateCodeOrAlias)
    } else {
      affiliate = AffiliateReg.getAffiliateParams(affiliateCodeOrAlias)[1]
    }

    if (affiliate === constants.nullAddr) {
      return null
    }

    return affiliate
  }


  function getTimestamp() {
    return (new Date).getTime() / 1000
  }

  function getKeyId(pk) {
    return cryptocoin.convertHex.bytesToHex(pk.slice(-4))
  }

  function encrypt(msg, pks, keypair) {

    const crystalObject = {
      pk: keypair.pk,
      packets: {}
    }

    pks.forEach((pk) => {

      const nonce = nacl.randomBytes(nacl.box.nonceLength)
      const ciphertext = nacl.box(new Uint8Array(msg), new Uint8Array(nonce), new Uint8Array(pk), new Uint8Array(keypair.sk))
      const pkId = getKeyId(pk)

      crystalObject.packets[pkId] = { nonce: Array.from(nonce), ciphertext: Array.from(ciphertext) }

    })

    return utils.convertObjectToHex(crystalObject)
  }

  function encryptObject(obj, pks, keypair) {
    return encrypt(convertObjectToBytes(obj), pks, keypair)
  }

  function decrypt(hex, keypairs) {

    const crystalObject = utils.convertHexToObject(hex)
    const keyIds = Object.keys(crystalObject.packets)
    let keypair
    let keyId

    keypairs.forEach((_keypair) => {
      const _keyId = utils.getKeyId(_keypair.pk)
      if (keyIds.indexOf(_keyId) > -1) {
        keyId = _keyId
        keypair = _keypair
        return false
      }
    })

    if (!keypair) {
      throw new Error('Could not find matching keypair')
    }

    const packet = crystalObject.packets[keyId]
    const result = nacl.box.open(new Uint8Array(packet.ciphertext), new Uint8Array(packet.nonce), new Uint8Array(crystalObject.pk), new Uint8Array(keypair.sk))

    if (result === false) {
      throw new Error('Failed to decrypt')
    } else {
      return result
    }

  }

  function decryptToObject(hex, keypairs) {
    return convertBytesToObject(decrypt(hex, keypairs))
  }

  function sha3(thing) {
    const thingHex = web3.toHex(thing)
    return `0x${web3.sha3(thingHex, { encoding: 'hex' })}`
  }

  angular.merge(this, {
    sanitize,
    convertObjectToHex,
    convertObjectToBytes,
    convertBytesToObject,
    convertBytesToHex,
    convertHexToObject,
    convertHexToBytes,
    convertCurrency,
    formatCurrency,
    convertCurrencyAndFormat,
    waitForTx,
    waitForTxs,
    check,
    isAddr,
    getAlias,
    toAscii,
    isAliasAvailable,
    send,
    getTypeOfAlias,
    getTypeOfAddr,
    runtimeBytecodes: {
      Store: contracts.Store.runtimeBytecode,
      Submarket: contracts.Submarket.runtimeBytecode
    },
    validateAddr,
    validateAlias,
    getContract,
    getContractAddressFromTxReceipt,
    getFunctionHash,
    getMartyrData,
    hexify,
    dehexify,
    getAliasedMartyrCalls,
    getRandom,
    getAffiliate,
    getTimestamp,
    getKeyId,
    encrypt,
    encryptObject,
    decrypt,
    decryptToObject,
    sha3
  })

})

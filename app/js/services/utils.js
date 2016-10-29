/* globals angular, Module, cryptocoin, web3, contracts, msgpack, abi, validate, nacl */

angular.module('app').service('utils', function utilsService(ticker, $q, $timeout, AliasReg, AffiliateReg, constants, $http) {

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

  function toBytes32(thing) {
    const hex = web3.toHex(thing)
    const hexWithout0x = hex.replace('0x', '')
    const missingZeros = '0'.repeat(66 - hex.length)
    return `0x${missingZeros}${hexWithout0x}`
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
    return JSON.stringify(object)
  }

  function convertObjectToBuffer(object) {
    return new Buffer(JSON.stringify(object))
  }

  function convertBytesToObject(bytes) {
    return JSON.parse(bytes)
  }

  function convertBytesToHex(bytes) {
    return hexify(cryptocoin.convertHex.bytesToHex(bytes))
  }

  function convertMultihashToBytes32Hex(mulithash) {
    const decodedMultihash = bs58.decode(mulithash)
    console.log('decodedMultihash', decodedMultihash)
    decodedMultihash.splice(0, 2)
    return convertBytesToHex(decodedMultihash)
  }

  function convertBytes32HexToMultihash(hex) {
    const bytes = convertHexToBytes(hex)
    bytes.unshift(18, 32)
    return bs58.encode(bytes)
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
      from: { presence: true, inclusion: Object.keys(ticker.prices), type: 'string' },
      to: { presence: true, inclusion: Object.keys(ticker.prices), type: 'string' }
    })

    amount =
      web3.toBigNumber(amount)
        .times(ticker.prices[currencies.from])
        .div(ticker.prices[currencies.to])

    if (currencies.to === 'WEI') {
      amount = amount.ceil()
    }

    return amount
  }

  function formatCurrency(amount, currency, doPrefix) {

    const prefix = doPrefix ? ` ${currency}` : ''
    const places = currency === 'ETH' ? 6 : 2

    const amountStringWithoutCommas = amount.toFixed(places).toString()
    const amountBeforePeriod = amountStringWithoutCommas.split('.')[0]
    const amountAfterPeriod = amountStringWithoutCommas.split('.')[1]

    return amountBeforePeriod.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + amountAfterPeriod + prefix

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
    console.log(txReciept)
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

  function fetchMartyrData(calls) {

    console.log(calls)

    const deferred = $q.defer()
    const callCodes = []
    const inputParams = []

    calls.forEach((call, i) => {
      if (!call.address) {
        throw new Error('Call object needs an address')
      }

      if (!call.data) {
        throw new Error('Call object needs data')
      }

      const callDataVar = `callData${i}`
      inputParams.push(`bytes ${callDataVar}`)
      callCodes.push(`address(${call.address}).call(${callDataVar});`)

    })

    const solCode = `contract Martyr{\r\nfunction Martyr(${inputParams.join(', ')}) { \r\n${callCodes.join('\r\n')}\r\n}\r\n}`

    console.log(solCode)

    $http({
      method: 'GET',
      url: '/api/compile',
      params: {
        solCode: solCode
      }
    }).then((response) => {
      if (response.data.errors && response.data.errors.length > 0) {
        deferred.reject(new Error(response.data.errors[0]))
      } else {
        const martyrFactory = web3.eth.contract(JSON.parse(response.data.contracts.Martyr.interface))
        const getDataParams = calls.map((call) => {
          return hexify(call.data.replace('0x', ''))
        }).concat({
          data: hexify(response.data.contracts.Martyr.bytecode)
        })

        console.log(getDataParams)
        console.log(martyrFactory.new.getData.apply(martyrFactory, getDataParams))

        deferred.resolve(martyrFactory.new.getData.apply(martyrFactory, getDataParams))
      }
    }, (err) => {
      deferred.reject(err)
    })

    return deferred.promise
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

    let _msg

    if (typeof msg === 'string') {
      if (msg.indexOf('0x') === 0) {
        _msg = convertHexToBytes(msg)
      } else {
        _msg = convertHexToBytes(web3.fromAscii(msg))
      }
    } else {
      _msg = msg
    }

    const crystalObject = {
      pk: keypair.pk,
      packets: {}
    }

    pks.forEach((pk) => {

      const nonce = nacl.randomBytes(nacl.box.nonceLength)
      const ciphertext = nacl.box(new Uint8Array(_msg), new Uint8Array(nonce), new Uint8Array(pk), new Uint8Array(keypair.sk))
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
    return hexify(`${web3.sha3(thingHex, { encoding: 'hex' })}`)
  }

  function wait(){
    console.log('start waiting')
    const timeoutPromise = $timeout(() => {}, 100000000000)

    return {
      cancel: () => {
        console.log('stop waiting')
        $timeout.cancel(timeoutPromise)
      }
    }
  }

  angular.merge(this, {
    sanitize,
    convertObjectToHex,
    convertObjectToBytes,
    convertObjectToBuffer,
    convertBytesToObject,
    convertBytesToHex,
    convertHexToObject,
    convertHexToBytes,
    convertCurrency,
    convertMultihashToBytes32Hex,
    convertBytes32HexToMultihash,
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
    fetchMartyrData,
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
    sha3,
    toBytes32,
    wait
  })

})

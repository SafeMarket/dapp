/* globals angular, validate, _ */

angular.module('app').run((utils) => {
  function exists(value, options) {
    if (options === true) {
      if (value === null || value === undefined) {
        return `${value} is ${typeof value}`
      }
      return null
    }

    if (value === null || value === undefined) {
      return null
    }

    return `${value} is ${typeof value}`
  }

  function aliasOfContract(value, options) {
    return utils.validateAlias(value, options) ? null : `is not a valid ${options}`
  }

  function addrOfContract(value, options) {
    return utils.validateAddr(value, options) ? null : `is not a valid ${options}`
  }

  function type(value, options) {
    if (value === null || value === undefined) {
      return null
    }

    if (options === 'array') {
      return typeof Array.isArray(value) ? null : 'is not an array'
    }

    if (options === 'identity') {
      return _.startsWith(value, '0x') && value.length === 132 ? null : 'is not a valid identity'
    }

    if (options === 'address') {
      return _.startsWith(value, '0x') && value.length === 42 ? null : 'is not a valid address'
    }

    if (options === 'alias') {
      if (value.valueOf() !== value.toLowerCase().replace(/[^a-z0-9]/g, '').valueOf()) {
        return 'can only be lower case letters and numbers'
      }
      return null
    }

    if (options === 'url') {
      const urlPattern = new RegExp(
        '^' +
          // protocol identifier
          '(?:(?:https?)://)' +
          // user:pass authentication
          '(?:\\S+(?::\\S*)?@)?' +
          '(?:' +
            // IP address exclusion
            // private & local networks
            '(?!(?:10|127)(?:\\.\\d{1,3}){3})' +
            '(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})' +
            '(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})' +
            // IP address dotted notation octets
            // excludes loopback network 0.0.0.0
            // excludes reserved space >= 224.0.0.0
            // excludes network & broacast addresses
            // (first & last IP address of each class)
            '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' +
            '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' +
            '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))' +
          '|' +
            // host name
            '(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)' +
            // domain name
            '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*' +
            // TLD identifier
            '(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))' +
            // TLD may end with dot
            '\\.?' +
          ')' +
          // port number
          '(?::\\d{2,5})?' +
          // resource path
          '(?:[/?#]\\S*)?' +
        '$', 'i'
      )

      if (!urlPattern.test(value)) {
        return 'is not a valid url'
      }
      return null
    }

    return typeof value === options ? null : `is not a ${options}`
  }

  function arrayOf(value, options) {
    let error = null

    value.forEach((element) => {
      const _error = validate.validators.type(element, options)
      if (_error) {
        error = _error
        return false
      }
      return true
    })

    return error
  }

  function startsWith(value, options) {
    if (!value) {
      return null
    }

    return _.startsWith(_.trim(value), options) ? null : `should start with ${options}`
  }

  function endsWith(value, options) {
    if (!value) {
      return null
    }
    return _.endsWith(_.trim(value), options) ? null : `should end with ${options}`
  }

  function unique(value) {
    return _.unique(value).length === value.length ? null : 'should be unique'
  }

  _.merge(validate.validators, {
    exists,
    aliasOfContract,
    addrOfContract,
    type,
    arrayOf,
    startsWith,
    endsWith,
    unique
  })
})

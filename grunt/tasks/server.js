module.exports = function exportGrunt(grunt) {
  grunt.registerTask('server', function registerServerTask() {

    this.async()

    const express = require('express')
    const compression = require('compression')
    const geth = grunt.file.readYAML('config/geth.yml')
    const solc = require('solc')

    Object.keys(geth).forEach((env) => {

      const rpccorsdomainParts = geth[env].rpccorsdomain.split(':')
      const port = parseInt(rpccorsdomainParts[rpccorsdomainParts.length - 1], 10)
      const app = express()

      app.use(compression())
      app.use(express.static(`${process.cwd()}/generated/dapp/${env}`))
      app.listen(port, '127.0.0.1')

      grunt.log.writeln(`Running ${env} server on port http://127.0.0.1:${port}`)

      app.get('/api/compile', (req, res) => {
        const solCode = req.query.solCode
        console.log(req.query, solCode)
        const solcOutput = solc.compile(solCode, 1)
        console.log(solcOutput)
        res.setHeader('Content-Type', 'application/json')
        res.send(JSON.stringify(solcOutput))
      })
    })
  })
}

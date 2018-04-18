var passport = require('passport')

module.exports = function (opts) {
  ['gateway', 'disableCaptcha','SignName','TemplateCode'].forEach(function (key) {
    process.env[key] && (opts[key] = process.env[key])
  })

  var service = require('./service')(opts)

  var self = this
  this.on('open', function () {
    var middle = self.servers.http.middle
    middle.use(passport.initialize())
    require('./router').call(service, middle)
  })
  return service
}

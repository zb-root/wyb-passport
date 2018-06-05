var MS = require('jm-ms')
let ms = MS()

module.exports = function (opts) {
  var o = {}
  o.config = opts
  var bind = function (name, uri) {
    uri || (uri = '/' + name)
    ms.client({
      uri: opts.gateway + uri
    }, function (err, doc) {
      !err && doc && (o[name] = doc)
    })
  }

  bind('sso')
  bind('user')
  bind('record')
  bind('verifycode')
  bind('captcha')
  bind('sms')
  o.passport = require('./passport')(o)
  o.config = opts
  return o
}

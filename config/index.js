require('log4js').configure(require('path').join(__dirname, 'log4js.json'))
var config = {
  development: {
    debug: true,
    lng: 'zh_CN',
    port: 3001,
    gateway: 'http://api.h5.jamma.cn:81',
    disableCaptcha: 0,
    SignName: '玖玖娱乐',
    TemplateCode: 'SMS_101165048',
    modules: {
      'passport': {
        module: process.cwd() + '/lib'
      }
    }
  },
  production: {
    lng: 'zh_CN',
    port: 80,
    gateway: 'http://gateway.app',
    SignName: '玖玖娱乐',
    TemplateCode: 'SMS_101165048',
    modules: {
      'passport': {
        module: process.cwd() + '/lib'
      }
    }
  }
}

var env = process.env.NODE_ENV || 'development'
config = config[env] || config['development']
config.env = env

module.exports = config

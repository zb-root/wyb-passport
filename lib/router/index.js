var _ = require('lodash')
var passport = require('passport')
var error = require('jm-err')
var Err = error.Err
var config = require('../../config')
var consts = require('../consts')

var constsErr = consts.default.Err
module.exports = function (router) {
  var service = this
  var key = 0
  var t = function (doc, lng) {
    if (lng && doc.err && doc.msg) {
      return {
        err: doc.err,
        msg: Err.t(doc.msg, lng) || doc.msg
      }
    }
    return doc
  }

    router.post('/login',
        function (req, res,next) {
            if (config.disableCaptcha) return next()
            console.info(req.body)
            if(!req.body.code) return next()
            var data = {}
            _.defaults(data, req.body, req.query)
            service.verifycode.get('/cc' + key + '/check', data, function (err, doc) {
                if (err) return res.json(doc)
                if (doc.err) return res.json(constsErr.FA_InValid_Code)
                next()
            })
        },
        passport.authenticate(['local'],{session: false}),
        function (req, res) {
            var doc = req.user
            doc.userId = doc.id
            res.json(t(doc,req.lng))
        }
    )

  router.post('/register',
    function (req, res) {
      var data = {}
      _.defaults(data, req.body, req.query)
      service.user.post('/signup', data)
        .then(function (doc) {
          if (doc.err) return res.json(doc)
          res.json({
            id: doc.id,
            uid: doc.uid
          })
        })
        .catch(function (err) {
          var doc = Err.FAIL
          err.code && (doc.err = err.code)
          err.message && (doc.msg = err.message)
          res.json(t(doc, req.lng))
        })
    })

    router.get('/captcha/:key', function (req, res) {
        key = req.params.key
        service.verifycode.get('/cc' + key, function (err, doc) {
            if (err) {
                logger.err(err.stack)
                return res.json(doc)
            }
            service.captcha.get('/' + doc.code, function (err, doc) {
                if (err) {
                    logger.err(err.stack)
                }
                res.json(doc)
            })
        })
    })

    router.get('/sms/:mobile', function (req, res) {
        var mobile = req.params.mobile
        var data = {}
				var pattern = /^1[3,4,5,7,8]{1}[0-9]{9}$/
				if(!pattern.test(mobile)) return res.json(constsErr.FA_InValid_Phone)
        _.defaults(data, req.body, req.query)
        service.verifycode.get('/' + mobile, function (err, doc) {
            if (err) return res.json(doc)
            service.sms.get('/send', {
                PhoneNumbers: mobile,
                SignName: service.config.SignName,
                TemplateCode: service.config.TemplateCode,
                TemplateParam: '{"code":"' + doc.code + '"}'
            }, function (err, doc) {
                if (err) {
                    logger.err(err.stack)
                }
                res.json(doc)
            })
        })
    })

    /**
     * @api {post} /login/mobile 验证码登录
     * @apiParam {String} mobile   手机号
     * @apiParam {String} code   验证码
     *
     * @apiParamExample {json} 请求参数例子:
     * {
   * }
     *
     * @apiSuccessExample {json} 成功:
     * {
   * }
     */
    router.post('/login/mobile', function (req, res) {
        var data = {}
        _.defaults(data, req.body, req.query)
        service.verifycode.get('/' + data.mobile + '/check', data, function (err, doc) {
            if (err) return res.json(doc)

            service.user.findUser({mobile:data.mobile}, function (err, docs) {
                if (err) return res.json(Err.FAIL)
                docs = docs || []
                if(!docs.length) return res.json(constsErr.FA_Not_Register)
                var user = docs[0]
                service.sso.post('/signon', {id: user._id}, function (err, doc) {
                    if (err) return res.json(doc)
                    res.json(doc)
                })
            })
        })
    })

    /**
     * @api {post} /resetPassword/mobile 验证码修改密码
     * @apiParam {String} mobile   手机号
     * @apiParam {String} code   验证码
     * @apiParam {String} password 新密码
     *
     * @apiParamExample {json} 请求参数例子:
     * {
   * }
     *
     * @apiSuccessExample {json} 成功:
     * {
   * }
     */
    router.post('/resetPassword/mobile', function (req, res) {
        var data = {}
        _.defaults(data, req.body, req.query)
        service.verifycode.get('/' + data.mobile + '/check', data, function (err, doc) {
            if (err) return res.json(doc)

            service.user.findUser(data.mobile, function (err, user) {
                if (err) return res.json(Err.FAIL)

                service.user.updateUser(user.id, {password: data.password}, function (err, doc) {
                    if (err) return res.json(Err.FAIL)
                    res.json({ret: 1})
                })
            })
        })
    })

}

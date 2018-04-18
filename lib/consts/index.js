var BaseErrCode = 4100

exports.default = {
	Err: {
		FA_InValid_Code: {
			err: BaseErrCode + 1,
			msg: '无效验证码'
		},
		FA_InValid_Phone: {
			err: BaseErrCode + 2,
			msg: '手机号格式错误'
		},
		FA_Not_Register: {
			err: BaseErrCode + 3,
			msg: '该手机号未注册'
		}
	}
}

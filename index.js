const Middleware = require('./src/Middleware')
const PropTypes = require('./src/PropTypes')
const Validate = require('./src/Validate')
const Message = require('./src/Message')
const common = require('./src/common')


/** ========== Default global option ========== */

Middleware.globalOption({
	//single, simple, full
	pathPropNameType: 'simple'
})

/** ========== PropTypes addRules ========== */

PropTypes.addRules({
	//String
	get string () {
		return PropTypes.makeRule({
			validType: (value, isDefaultValue) => {
				return typeof value === 'string'
			},
			validRequired: (value) => {
				return value.length > 0
			},
			convert: (value) => {
				if (typeof value === 'string') {
					return value
				} else {
					return value || ''
				}
			}
		})
	},

	//Number & Numberic string
	get number () {
		return PropTypes.makeRule({
			validType: (value, isDefaultValue) => {
				if (!isDefaultValue && typeof value === 'string') {
					return /^-*[0-9]*[\.]*[0-9]+$/.test(value) && !/^0[0-9]+/.test(value) && !/^-0[0-9]+/.test(value) && !(value.length === 1 && value === '-')
				} else {
					return typeof value === 'number'
				}
			},
			validRequired: (value) => {
				return !common.isEmpty(value)
			},
			convert: (value) => {
				if (typeof value === 'string') {
					return Number(value)
				} else {
					return value
				}
			}
		})
	},

	//Integer & Integeric string
	get integer () {
		return PropTypes.makeRule({
			validType: (value, isDefaultValue) => {
				if (!isDefaultValue && typeof value === 'string') {
					return /^-*[0-9]+$/.test(value) && !/^0[0-9]+/.test(value) && !/^-0[0-9]+/.test(value) && !(value.length === 1 && value === '-')
				} else {
					return Number.isInteger(value)
				}
			},
			validRequired: (value) => {
				return !common.isEmpty(value)
			},
			convert: (value) => {
				if (typeof value === 'string') {
					return parseInt(value)
				} else {
					return value
				}
			}
		})
	},

	//Boolean & Boolean string
	get bool () {
		return PropTypes.makeRule({
			validType: (value, isDefaultValue) => {
				return !isDefaultValue && typeof value === 'string' ? /^(true|false)$/.test(value) : typeof value === 'boolean'
			},
			validRequired: (value) => {
				return !common.isEmpty(value)
			},
			convert: (value) => {
				if (value === 'true') {
					return true
				} else if (value === 'false') {
					return false
				} else {
					return value
				}
			}
		})
	}
})


/** ========== Validate addRules ========== */

Validate.addRules({
	/**
	 * @param {String | Array | Object} value 
	 * @param {Object} option 	{ min, max }
	 */
	length: {
		valid: (value, option, sibling, event) => {
			const length = common.isObject(value) ? Object.keys(value).length : (value?.length || 0)

			if (common.isObject(option)) {
				let isValid = true
				
				if (!common.isEmpty(option.min)) {
					isValid = length >= option.min
				}
				if (isValid && !common.isEmpty(option.max)) {
					isValid = length <= option.max
				}

				return isValid
			} else {
				return length == option
			}
		},
		message: `length of '{{propName}}'{{#unless max}} can be from {{#unless min}}{{min}} {{/unless}}~ {{max}}{{/unless}}{{#less max}} must be {{option}}{{/less}}`
	},

	/**
	 * @param {Number | Int} 	value 
	 * @param {Int} 	option 
	 */
	min: {
		valid: (value, option, sibling, event) => {
			const val = common.isNumber(value) ? value : 0
			return val >= option
		},
		message: `'{{propName}}' can be from {{option}}`
	},

	/**
	 * @param {Number | Int} 	value 
	 * @param {Int} 	option 	
	 */
	max: {
		valid: (value, option, sibling, event) => {
			const val = common.isNumber(value) ? value : 0
			return val <= option
		},
		message: `'{{propName}}' can be up to {{option}}`
	},

	/**
	 * @param {Number | Int | String | Boolean} 		value 
	 * @param {Array} 	option 	[1, 2]
	 */
	or: {
		valid: (value, option, sibling, event) => {
			const opt = Array.isArray(option) ? option : []
			return opt.includes(value)
		},
		message: `'{{propName}}' can only have values {{option}}`
	},

	/**
	 * @param {String} 		value 
	 */
	digit: {
		valid: (value, option, sibling, event) => {
			return /^[0-9]+$/.test(value)
		},
		message: `'{{propName}}' can only be the string 0-9`
	},

	/**
	 * @param {String} 		value 
	 * @param {String} 		option 	upper, lower
	 */
	alphabet: {
		valid: (value, option, sibling, event) => {
			let reg = /^[a-z]+$/i

			if (option === 'upper') {
				reg = /^[A-Z]+$/
			} else if (option === 'lower') {
				reg = /^[a-z]+$/
			}

			return reg.test(value)
		},
		message: `'{{propName}}' can only contain {{#unless option}}{{option}} {{/unless}}alphabets`
	},

	/**
	 * alphabets + 0-9
	 * @param {String} 		value 
	 * @param {String} 		option 	upper, lower
	 */
	alphaDigit: {
		valid: (value, option, sibling, event) => {
			let reg = /^[a-z0-9]+$/i

			if (option === 'upper') {
				reg = /^[A-Z0-9]+$/
			} else if (option === 'lower') {
				reg = /^[a-z0-9]+$/
			}

			return reg.test(value)
		},
		message: `'{{propName}}' can only contain {{#unless option}}{{option}} {{/unless}}alphabets and 0-9`
	}
})


exports.common = common
exports.Message = Message
exports.Middleware = Middleware
exports.PropTypes = PropTypes
exports.Validate = Validate
//short constant
exports.Prop = PropTypes
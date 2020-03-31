const Middleware = require('./src/Middleware')
const PropTypes = require('./src/PropTypes')
const common = require('./src/common')

/** ========== addRules ========== */

PropTypes.addRules({
	//String
	get string () {
		return PropTypes.makeRule({
			validType: (value) => {
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
			validType: (value) => {
				if (typeof value === 'string') {
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
			validType: (value) => {
				if (typeof value === 'string') {
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
			validType: (value) => {
				return typeof value === 'string' ? /^(true|false)$/.test(value) : typeof value === 'boolean'
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
	},

	//Array
	get array () {
		return PropTypes.makeRule({
			validType: (value) => {
				return Array.isArray(value)
			},
			validRequired: (value) => {
				return value.length > 0
			},
			convert: (value) => {
				return value || []
			}
		})
	}
})


exports.Middleware = Middleware
exports.PropTypes = PropTypes
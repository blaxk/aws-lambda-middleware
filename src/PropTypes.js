const common = require('./common')

/**
 * PropTypes
 * ex)
 * PropTypes.string
 * PropTypes.string.default = '200'
 * PropTypes.string.isRequired
 */
const PropTypes = {
	
	/** ========== Public Methods ========== */
	
	addRules (obj) {
		Object.setPrototypeOf(PropTypes, obj)
	},

	makeRule ({ validType, validRequired, convert } = {}) {
		return {
			_invalid: (propName, value) => {
				if (typeof validType === 'function' && !common.isEmpty(value) && !validType(value)) {
					return `invalid parameter type "${propName}"`
				}
			},
			_convert: convert,

			get isRequired () {
				return {
					_invalid: (propName, value) => {
						if (typeof validType === 'function' && typeof validRequired === 'function') {
							if (common.isEmpty(value)) {
								return `required parameter "${propName}"`
							} else if (!validType(value)) {
								return `invalid parameter type "${propName}"`
							} else if (!validRequired(value)) {
								return `required parameter "${propName}"`
							}
						}
					},
					_convert: convert,
					_required: true
				}
			},

			/**
			 * Set the value that is replaced when the request value is empty
			 * @param {*} val
			 */
			default: (val) => {
				let defaultVal = undefined
				let defaultValError = ''

				if (typeof validType === 'function') {
					if (!common.isEmpty(val, true) && validType(val)) {
						defaultVal = val
					} else {
						defaultValError = true
					}
				}

				return {
					_invalid: (propName, value) => {
						if (defaultValError) {
							return `invalid default parameter type "${propName}"`
						} else if (typeof validType === 'function' && !common.isEmpty(value) && !validType(value)) {
							return `invalid parameter type "${propName}"`
						}
					},
					_convert: convert,
					_default: defaultVal
				}
			}
		}
	}
}


module.exports = PropTypes
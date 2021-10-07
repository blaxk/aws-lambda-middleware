const common = require('./common')

/**
 * PropTypes
 * ex)
 * PropTypes.string
 * PropTypes.string.default('200')
 * PropTypes.string.isRequired
 */
const PropTypes = {
	
	/** ========== Public Methods ========== */
	
	addRules (obj) {
		// Object.setPrototypeOf(PropTypes, obj)
		for (const key in obj) {
			PropTypes[key] = obj[key]
		}
	},

	makeRule ({ validType, validRequired, convert } = {}) {
		const invalid = (propName, value) => {
			if (typeof validType === 'function' && !common.isEmpty(value) && !validType(value)) {
				return `invalid parameter type '${propName}'`
			}
		}
		
		return {
			_invalid: invalid,
			_convert: convert,

			get isRequired () {
				return {
					_invalid: (propName, value) => {
						if (typeof validType === 'function' && typeof validRequired === 'function') {
							if (common.isEmpty(value)) {
								return `required parameter '${propName}'`
							} else if (!validType(value)) {
								return `invalid parameter type '${propName}'`
							} else if (!validRequired(value)) {
								return `required parameter '${propName}'`
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
				const defaultVal = common.isEmpty(val, true) ? undefined : val

				return {
					_invalid: invalid,
					// _convert: convert,
					_default: async (propName, event) => {
						if (typeof defaultVal === 'function') {
							try {
								const value = defaultVal(event)
								
								if (invalid(propName, value)) {
									const invalidMsg = `'${propName}' default value type error`
									common.error(`${invalidMsg}, -value:`, value, ' -type:', typeof value)
									return Promise.reject(invalidMsg)
								} else {
									return common.clone(value)
								}
							} catch (error) {
								const errMsg = `'${propName}' default function execution error`
								common.error(`${errMsg}:`, error)
								return Promise.reject(errMsg)
							}
						} else {
							return common.clone(defaultVal)
						}
					}
				}
			}
		}
	}
}


module.exports = PropTypes
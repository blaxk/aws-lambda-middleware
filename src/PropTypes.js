const common = require('./common')

/**
 * PropTypes
 * ex)
 * PropTypes.string
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
			_required: false,
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
			}
		}
	}
}


module.exports = PropTypes
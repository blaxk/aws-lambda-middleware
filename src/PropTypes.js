const ValidateRule = require('./ValidateRule')
const common = require('./common')


/**
 * PropTypes
 * ex)
 * PropTypes.string
 * PropTypes.string.default('200')
 * PropTypes.string.required()
 */
const PropTypes = {
	
	/** ========== Public Methods ========== */

	//Array
	get array () {
		return PropTypes.makeRule({
			propType: 'array',
			validType: (value, isDefaultValue) => {
				return Array.isArray(value)
			},
			validRequired: (value) => {
				return !common.isEmpty(value)
			}
		})
	},

	//Object
	get object () {
		return PropTypes.makeRule({
			propType: 'object',
			validType: (value, isDefaultValue) => {
				return common.isObject(value)
			},
			validRequired: (value) => {
				return !common.isEmpty(value)
			}
		})
	},
	
	/**
	 * add propType rules
	 * @param {Object} obj
	 */
	addRules (obj) {
		for (const key in obj) {
			if (/^_/.test(key) || common.RESERVED_PROPS.includes(key)) {
				common.error(`'${key}' is a reserved word and cannot be added to the rule.`)
			} else if (Object.hasOwn(ValidateRule.prototype, key)) {
				common.error(`'${key}' rule cannot be added because it overlaps with the validate rule.`)
			} else {
				const prop = Object.getOwnPropertyDescriptor(obj, key)
				Object.defineProperty(PropTypes, key, prop)
			}
		}
	},

	/**
	 * Make propType rule
	 * @param {Object} rule
	 *  - {Function}	validType
	 *  - {Function}	validRequired
	 *  - {Function}	convert
	 * @returns {Object}
	 */
	makeRule ({ propType, validType, validRequired, convert } = {}) {
		return new ValidateRule({ propType, validType, validRequired, convert })
	},

	/**
	 * @param {*} val
	 * @returns {Boolean}
	 */
	isEmpty (val) {
		return common.isEmpty(val)
	}
}


module.exports = PropTypes
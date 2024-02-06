const ValidateRule = require('./ValidateRule')
const PropTypes = require('./PropTypes')
const common = require('./common')



const Validate = {
	
	/** ========== Public Methods ========== */
	
	/**
	 * add validate rules
	 * @param {Object} obj
	 */
	addRules (obj) {
		for (const key in obj) {
			if (/^_/.test(key) || common.RESERVED_PROPS.includes(key)) {
				common.error(`'${key}' is a reserved word and cannot be added to the rule.`)
			} else if (Object.hasOwn(PropTypes, key)) {
				common.error(`'${key}' rule cannot be added because it overlaps with the propType rule.`)
			} else {
				ValidateRule.addRule(key, obj[key])
			}
		}
	}
}


module.exports = Validate
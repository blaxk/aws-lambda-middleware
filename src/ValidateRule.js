const common = require('./common')
const Message = require('./Message')
const PropTypeRule = require('./PropTypeRule')

const _rules = {}

/**
 * @param {Object} options
 */
function ValidateRule (options) {
	PropTypeRule.call(this, options)
	
	this._validate = {
		//boolean, function
		required: false
	}
}

//add rule method
ValidateRule.addRule = function (key, rule) {
	if (!Object.hasOwn(_rules, key)) {
		_rules[key] = {}
	}

	Object.assign(_rules[key], rule)

	ValidateRule.prototype[key] = function (option) {
		this._validate[key] = {
			valid: _rules[key].valid,
			message: _rules[key].message,
			option: common.isEmpty(option, true) ? {} : option
		}

		return this
	}
}

ValidateRule.prototype = Object.assign(PropTypeRule.prototype, {

	/** ========== Public Methods ========== */

	/**
	 * Set the value to required.
	 * @param {Function} 	func 	It is designated as a required item by the return value of the function (Optional)
	 *  - @param {Object}	event	Lambda event objects correct by PropTypes
	 * 	- @returns {Boolean}
	 * @returns {ValidateRule}
	 */
	required (func) {
		if (this._props.default) {
			common.error(`'isRequired' and 'default' cannot be set at the same time`)
		} else {
			if (typeof func === 'function') {
				this._validate.required = func
			} else {
				this._validate.required = true
			}
		}

		return this
	},

	/**
	 * @param {Function} 	func 	It is designated as a required item by the return value of the function (Optional)
	 *  - @param {*}		value
	 *  - @param {Object}	event	Lambda event objects correct by PropTypes
	 * 	- @returns {Boolean}
	 * @returns {ValidateRule}
	 */
	valid (func) {
		if (typeof func === 'function') {
			this._validate.valid = func
		}

		return this
	},

	/** ========== Private Methods ========== */

	/**
	 * valid
	 * @param {String} 	propName 
	 * @param {Object} 	sibling 
	 * @param {Object} 	event 
	 * @param {Object} 	etcOption 
	 * @returns {String}	error message
	 */
	_validValidateRules (propName, sibling, event, etcOption = {}) {
		let value = this._toValue(propName, sibling)

		//check required function
		if (this._validate.required === true || (typeof this._validate.required === 'function' && this._validate.required(this._getSibling(propName, sibling), event))) {
			if (typeof this._props.validRequired === 'function') {
				if (common.isEmpty(value)) {
					return Message.getMessage('param-required', { propName: this._getPropName(propName, etcOption), value })
				} else if (!this._props.validRequired(value)) {
					return Message.getMessage('param-required', { propName: this._getPropName(propName, etcOption), value })
				}
			}
		}

		if (!common.isEmpty(value)) {
			if (typeof this._validate.valid === 'function' && !this._validate.valid(value, this._getSibling(propName, sibling), event)) {
				return Message.getMessage('validate-invalid-func', { propName: this._getPropName(propName, etcOption), value })
			}

			//check validate
			for (const key in this._validate) {
				if (!['required', 'valid'].includes(key)) {
					//{ valid, message, option }
					const rule = this._validate[key]

					if (typeof rule.valid === 'function' && !rule.valid(value, rule.option, this._getSibling(propName, sibling), event)) {
						return this._errorMessage(this._getPropName(propName, etcOption), value, rule)
					}
				}
			}
		}
	},

	_errorMessage (propName, value, rule) {
		let result = ''

		if (rule.message) {
			const rowOpt = common.isObject(rule.option) ? rule.option : { option: Array.isArray(rule.option) ? rule.option.join(', ') : rule.option }
			result = Message.toMessage(rule.message, { propName, value, ...rowOpt })
		}

		return result || Message.getMessage('validate-default-invalid', { propName, value })
	}
	
})


module.exports = ValidateRule
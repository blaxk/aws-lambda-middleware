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
			option: option
		}

		if (this._props.required) {
			throw new Error(`'isRequired.${key}' is not a function that can be used.`)
		} else {
			return this
		}
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
		if (this._props.required) {
			throw new Error(`'isRequired.required' is not a function that can be used.`)
		} else if (!common.isEmpty(this._props.default, true)) {
			throw new Error(`'isRequired' and 'default' cannot be set at the same time`)
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
		if (this._props.required) {
			throw new Error(`'isRequired.valid' is not a function that can be used.`)
		} else if (typeof func === 'function') {
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
		const value = this._toValue(propName, sibling)

		//check required function
		if (this._validate.required === true || (typeof this._validate.required === 'function' && this._validate.required(this._getFuncParams(propName, sibling, event)))) {
			if (typeof this._props.validRequired === 'function' && !this._props.validRequired(value)) {
				return Message.getMessage('param-required', { propName: this._getPropName(propName, etcOption), value })
			}
		}

		if (!common.isEmpty(value)) {
			if (typeof this._validate.valid === 'function' && !this._validate.valid(this._getFuncParams(propName, sibling, event))) {
				return Message.getMessage('validate-invalid-func', { propName: this._getPropName(propName, etcOption), value })
			}

			//check validate
			for (const key in this._validate) {
				if (!['required', 'valid'].includes(key)) {
					//{ valid, message, option }
					const rule = this._validate[key]

					if (typeof rule.valid === 'function') {
						const option = this._getOption(rule, propName, sibling, event)

						if (!rule.valid(value, option, sibling, event)) {
							return this._errorMessage(this._getPropName(propName, etcOption), value, rule.message, option)
						}
					}
				}
			}
		}
	},

	_getOption (rule, propName, sibling, event) {
		let result = undefined

		if (typeof rule.option === 'function') {
			result = rule.option(this._getFuncParams(propName, sibling, event))
		} else {
			result = rule.option
		}

		return result
	},

	_errorMessage (propName, value, message, option) {
		let result = ''

		if (message) {
			const rowOpt = common.isObject(option) ? option : { option: Array.isArray(option) ? option.join(', ') : option }
			result = Message.toMessage(message, { propName, value, ...rowOpt })
		}

		return result || Message.getMessage('validate-default-invalid', { propName, value })
	}
	
})


module.exports = ValidateRule
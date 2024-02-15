const common = require('./common')
const Message = require('./Message')

let _uid = Date.now()



/**
 * @param {Object} options
 *  - {Function}	validType
 *  - {Function}	validRequired
 *  - {Function}	convert
 */
function PropTypeRule (options = {}) {
	this._props = {
		type: options.propType,
		validType: options.validType,
		validRequired: options.validRequired,
		convert: options.convert,

		//boolean
		trim: undefined,
		//boolean, function
		required: false,
		//function, *
		default: undefined,
		item: undefined
	}

	this._id = Number(++_uid).toString(32)
	this._isRule = true
}


PropTypeRule.prototype = {

	/** ========== Public Methods ========== */

	/**
	 * Required
	 * !Replaced by the "ValidateRule.required" function, which allows you to set various options.
	 */
	get isRequired () {
		if (this._props.default) {
			throw new Error(`'isRequired' and 'default' cannot be set at the same time.`)
		} else {
			this._props.required = true
		}
		
		return this
	},

	/**
	 * Set the value that is replaced when the request value is empty
	 * @param {*} val
	 * @returns {PropTypeRule}
	 */
	default (val) {
		if (this._props.required) {
			throw new Error(`'default' and 'isRequired' cannot be set at the same time.`)
		} else {
			this._props.default = val
		}

		return this
	},

	/**
	 * Setting PropTypes of item element of an array or object
	 * @param {Array | Object | Function} elements
	 * 	{ key: PropTypeRule } || [PropTypeRule] || [{ key: PropTypeRule }]
	 * @returns {PropTypeRule}
	 */
	item (elements) {
		let error = ''

		if (common.isEmpty(elements)) {
			if (elements) {
				error = `An empty ${this._props.type} cannot be placed in ${this._props.type}.item`
			} else {
				error = `An empty value cannot be entered in ${this._props.type}.item`
			}
		} else {
			const type = common.type(elements, true)

			if (type === 'function' || (this._props.type === type && !elements._isRule)) {
				this._props.item = elements
			} else {
				error = `Only ${this._props.type} can be set in ${this._props.type}.item`
			}
		}

		if (error) {
			common.error(error)
		}

		return this
	},

	/**
	 * Options to set for PropType
	 * It has a higher priority than options set in GlobalOption, etc.
	 * @param {Object} option
	 * 	- {Boolean} trim
	 *  - {String} pathPropNameType
	 *  - {Array} ignoreFirstPathPropNames
	 * @returns {PropTypeRule}
	 */
	option (option) {
		if (option && common.isObject(option)) {
			if (typeof option.trim === 'boolean') {
				this._props.trim = option.trim
			}

			if (option.pathPropNameType && typeof option.pathPropNameType === 'string') {
				this._props.pathPropNameType = option.pathPropNameType
			}

			if (option.ignoreFirstPathPropNames && Array.isArray(option.ignoreFirstPathPropNames)) {
				this._props.ignoreFirstPathPropNames = option.ignoreFirstPathPropNames
			}
		}

		return this
	},

	/** ========== Private Methods ========== */

	/**
	 * propType valid
	 * @param {String} 	propName 
	 * @param {Object} 	sibling 	request data sibling
	 * @param {Object} 	event 		lambda event object
	 * @param {Object} 	etcOption 
	 * @returns {String}	error message
	 */
	_validPropRules (propName, sibling, event, etcOption = {}) {
		// sibling = object, array
		let value = this._toValue(propName, sibling)

		//trim
		if (value && typeof value === 'string') {
			sibling[propName] = value = this._trim(value, etcOption)
		}
		
		//check required
		if (this._props.required) {
			if (typeof this._props.validType === 'function' && typeof this._props.validRequired === 'function') {
				if (this._props.validType(value)) {
					if (!this._props.validRequired(value)) {
						return Message.getMessage('param-required', { propName: this._getPropName(propName, etcOption), value })
					}
				} else {
					return Message.getMessage('param-invalid-type', { propName: this._getPropName(propName, etcOption), value })
				}
			}
		} else {
			if (!common.isEmpty(value, true) && typeof this._props.validType === 'function' && !this._props.validType(value)) {
				return Message.getMessage('param-invalid-type', { propName: this._getPropName(propName, etcOption), value })
			}
		}
		
		//set value & convert
		if (common.isEmpty(value)) {
			try {
				const defaultData = this._default(propName, sibling, event)

				if (defaultData.value !== undefined) {
					sibling[propName] = value = defaultData.value
				}

				if (defaultData.error) {
					return defaultData.error
				}
			} catch (err) {
				return err?.stack || err.message
			}
		} else {
			sibling[propName] = value = this._convert(value)
		}
	},

	_convert (value) {
		if (typeof this._props.convert === 'function') {
			return this._props.convert(value)
		} else {
			return value
		}
	},

	//@returns {Object}	{ value, error }
	_default (propName, sibling, event) {
		let value
		let error = ''

		if (this._props.default) {
			if (typeof this._props.default === 'function') {
				try {
					value = this._props.default(this._getFuncParams(propName, sibling, event))
				} catch (err) {
					common.error(err)
					error = Message.getMessage('error-default-func', { propName, value })
				}
			} else {
				value = this._props.default
			}

			//valid type
			if (!common.isEmpty(value, true) && typeof this._props.validType === 'function' && !this._props.validType(value, true)) {
				error = Message.getMessage('error-default-value', { propName, value })
			} else {
				value = common.clone(value)
			}
		}

		return {
			value,
			error
		}
	},

	//@returns {Object}
	_getItem (propName, sibling, event) {
		let item = null
		let error = ''

		if (typeof this._props.item === 'function') {
			item = this._props.item(this._getFuncParams(propName, sibling, event))

			if (common.isEmpty(item)) {
				error = `An empty value cannot be entered in ${this._props.type}.item!`
			} else {
				const type = common.type(item, true)

				if (this._props.type !== type) {
					item = null
					error = `Only ${this._props.type} can be set in ${this._props.type}.item!`
				}
			}
		} else {
			item = this._props.item
		}

		if (error) {
			common.error(error)
		}

		return item
	},

	_toValue (propName, sibling) {
		let result = undefined

		if (sibling && typeof sibling === 'object' && Object.hasOwn(sibling, propName)) {
			result = sibling[propName]
		}

		return result
	},

	//functional parameter
	_getFuncParams (propName, sibling, event) {
		const value = this._toValue(propName, sibling)

		return {
			v: value,
			s: sibling,
			e: event,
			p: propName,
			value,
			sibling,
			event,
			propName
		}
	},

	_trim (value, etcOptions) {
		let isTrim = !!etcOptions.isTrim

		if (!common.isEmpty(this._props.trim)) {
			isTrim = !!this._props.trim
		}
		
		return isTrim ? value.trim() : value
	},

	_getPropName (propName, etcOption = {}) {
		let result = propName

		if (Array.isArray(etcOption.pathPropNames) && etcOption.pathPropNames.length) {
			if (etcOption.ignoreFirstPathPropNames?.length && etcOption.ignoreFirstPathPropNames.includes(etcOption.pathPropNames[0]) && etcOption.pathPropNames.length > 1) {
				etcOption.pathPropNames.shift()
			}

			if (etcOption.pathPropNameType === 'full') {
				result = etcOption.pathPropNames.join('.')
			} else if (etcOption.pathPropNameType === 'simple') {
				result = etcOption.pathPropNames.slice(-3).join('.')
			}
		}

		return result
	}
}


module.exports = PropTypeRule
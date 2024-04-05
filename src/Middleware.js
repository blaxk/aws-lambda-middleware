const PropTypes = require('./PropTypes')
const common = require('./common')

const _globalOptions = {}


class Middleware {

	/**
	 * set global options
	 * @param {Object} options
	 */
	static globalOption (options = {}) {
		if (common.isObject(options)) {
			for (const key in options) {
				_globalOptions[key] = options[key]
			}
		} else {
			common.error('The globalOptions type is available only for objects.')
		}
	}

	/**
	 * @param {Object} options	cluster options
	 */
	constructor (options = {}) {
		if (common.isObject(options)) {
			this._options = options
		} else {
			this._options = {}
			common.error('The clusterOptions type is available only for objects.')
		}
		
		this._flows = []
		this._handler = this._handler.bind(this)
		this._handler.add = this.add.bind(this)
		this._handler.valid = this.valid.bind(this)
		this._handler.handler = this.handler.bind(this)
	}

	/** ========== Public Methods ========== */
	
	/**
	 * add flow handler & propTypes
	 * @param {Function, Object} data
	 */
	add (data) {
		if (common.isObject(data)) {
			this._flows.push({
				type: 'props',
				props: data
			})
		} else if (typeof data === 'function') {
			this._flows.push({
				type: 'handler',
				handler: data
			})
		}
		
		return this._handler
	}

	/**
	 * add orgin lambda handler
	 * @param {Function} func
	 */
	handler (func) {
		if (typeof func === 'function') {
			this._flows.push({
				type: 'lambda-handler',
				handler: func
			})
		}

		return this._handler
	}

	/**
	 * Validate data with "PropTypeRule + ValidateRule" set in Middleware
	 * @param {Object} 	data	Data to be validated
	 * @returns {Object}	{ status, message }
	 * 	status = none, valid, invalid, error
	 */
	valid (data) {
		//none, valid, invalid, error
		let status = 'none'
		let error = ''
		
		if (data && typeof data === 'object') {
			for (const i in this._flows) {
				const flow = this._flows[i]

				if (flow.type === 'props') {
					try {
						error = this._validError(data, flow.props)

						if (error) {
							status = 'invalid'
						}
					} catch (err) {
						error = err?.stack || err?.message || 'valid error!'
						status = 'error'
					}
				}

				if (error) break
			}

			if (!error) {
				status = 'valid'
			}
		}

		return {
			status,
			message: error
		}
	}

	/** ========== Private Methods ========== */
	
	//lambda handler
	async _handler (event = {}, context = {}, callback) {
		const evt = await this._parseEvent(event)
		const flowLength = this._flows.length
		let prevData = {}

		if (evt.middlewareBodyParseError) {
			common.error(evt.middlewareBodyParseError)
			callback(null, {
				..._globalOptions.callbackData,
				...this._options.callbackData,
				statusCode: 400,
				body: JSON.stringify({
					message: evt.middlewareBodyParseError
				})
			})
		} else {
			for (const i in this._flows) {
				const flow = this._flows[i]
				const isLambdaHandler = flow.type === 'lambda-handler'

				try {
					if (flow.type === 'props') {
						prevData = await this._validation(evt, flow.props)
					} else if (flow.type === 'handler') {
						prevData = await flow.handler(evt, context, prevData)
					} else if (isLambdaHandler) {
						prevData = await flow.handler(evt, context, callback)
					}

					//last flow callback
					if (flowLength - 1 == i) {
						if (isLambdaHandler) {
							return prevData
						} else {
							callback(null, common.isObject(prevData) ? {
								..._globalOptions.callbackData,
								...this._options.callbackData,
								...prevData
							} : prevData)
						}

						break
					}
				} catch (error) {
					if (isLambdaHandler) {
						common.error(error?.message || error?.stack)
						return error
					} else {
						common.error(error)

						if (common.isError(error)) {
							callback(error)
						} else {
							callback(null, common.isObject(error) ? {
								..._globalOptions.callbackData,
								...this._options.callbackData,
								...error
							} : error)
						}
					}

					break
				}
			}
		}
	}

	//propType and validate
	async _validation (event, props) {
		const errorMsg = this._validError(event, props)

		if (errorMsg) {
			return Promise.reject({
				statusCode: 400,
				body: JSON.stringify({
					message: errorMsg
				})
			})
		} else {
			return {}
		}
	}
	
	/**
	 * All request data is validated using PropTypeRule and ValidateRule and an error message is returned.
	 * @param {Object} event 
	 * @param {Object} ruleGroup 
	 * @returns {String}
	 */
	_validError (event, ruleGroup) {
		let error = ''

		if (event && typeof event === 'object' && common.isObject(ruleGroup)) {
			//propType check
			for (const propName in ruleGroup) {
				error = this._validProps(propName, ruleGroup, event, event, [propName])
				if (error) break
			}

			if (!error) {
				//validate check
				for (const propName in ruleGroup) {
					error = this._validValidates(propName, ruleGroup, event, event, [propName])
					if (error) break
				}
			}
		}

		return error
	}

	/**
	 * recursive call function
	 * @param {String} propName 
	 * @param {Object} rules
	 * @param {*} sibling 
	 * @param {Object} event 
	 * @param {Array} pathPropNames
	 * @returns {String}
	 */
	_validProps (propName, rules, sibling, event, pathPropNames = []) {
		let error = ''
		const propTypeRule = this._getRule(rules[propName])

		if (propTypeRule) {
			error = propTypeRule._validPropRules(propName, sibling, event, {
				...this._getEtcOption(),
				pathPropNames
			})
			
			//When a rule item exists inside propTypeRule
			if (!error && propTypeRule._props.item) {
				const value = propTypeRule._toValue(propName, sibling)
				const item = propTypeRule._getItem(propName, sibling, event)

				if (item && !common.isEmpty(value)) {
					if (common.isObject(item)) {
						for (const key in item) {
							error = this._validProps(key, item, value, event, [...pathPropNames, key])
							if (error) break
						}
					} else if (Array.isArray(item)) {
						const arryItems = this._makeArrayItems(value, item)

						//array all value
						for (const i in value) {
							error = this._validProps(i, arryItems, value, event, [...pathPropNames, i])
							if (error) break
						}
					}
				}
			}
		}

		return error
	}

	/**
	 * recursive call function
	 */
	_validValidates (propName, rules, sibling, event, pathPropNames = []) {
		let error = ''
		const propTypeRule = this._getRule(rules[propName])

		if (propTypeRule) {
			error = propTypeRule._validValidateRules(propName, sibling, event, {
				...this._getEtcOption(),
				pathPropNames
			})
			
			//When a rule item exists inside validateRule
			if (!error && propTypeRule._props.item) {
				const value = propTypeRule._toValue(propName, sibling)
				const item = propTypeRule._getItem(propName, sibling, event)

				if (item && !common.isEmpty(value)) {
					if (common.isObject(item)) {
						for (const key in item) {
							error = this._validValidates(key, item, value, event, [...pathPropNames, key])
							if (error) break
						}
					} else if (Array.isArray(item)) {
						const arryItems = this._makeArrayItems(value, item)

						//array all value
						for (const i in value) {
							error = this._validValidates(i, arryItems, value, event, [...pathPropNames, i])
							if (error) break
						}
					}
				}
			}
		}

		return error
	}

	_getRule (propTypeRule) {
		let result = null

		if (propTypeRule) {
			if (propTypeRule._isRule) {
				result = propTypeRule
			} else if (common.isObject(propTypeRule) || Array.isArray(propTypeRule)) {
				//Object and Array create default PropTypes
				//"required" must be present to maintain compatibility with versions prior to v1.0
				const rule = Array.isArray(propTypeRule) ? PropTypes.array.required() : PropTypes.object.required()

				if (!common.isEmpty(propTypeRule)) {
					rule.item(propTypeRule)
				}

				result = rule
			}
		}

		return result
	}

	_makeArrayItems (values, items) {
		const result = []
		const itemLength = items.length

		for (const i in values) {
			result.push(items[i % itemLength])
		}

		return result
	}

	_getEtcOption () {
		let isTrim = !!_globalOptions.trim
		let pathPropNameType = _globalOptions.pathPropNameType
		let ignoreFirstPathPropNames = _globalOptions.ignoreFirstPathPropNames || []

		if (!common.isEmpty(this._options.trim)) {
			isTrim = !!this._options.trim
		}

		if (!common.isEmpty(this._options.pathPropNameType)) {
			pathPropNameType = this._options.pathPropNameType
		}

		if (Array.isArray(this._options.ignoreFirstPathPropNames)) {
			ignoreFirstPathPropNames = this._options.ignoreFirstPathPropNames
		}

		return {
			isTrim,
			pathPropNameType,
			ignoreFirstPathPropNames
		}
	}

	async _parseEvent (event = {}) {
		/**
		 * Lambda payload 1.0 = event.requestContext.httpMethod
		 * Lambda payload 2.0 = event.requestContext.http.method
		 */
		const isLambdaPayload = event.requestContext && (event.requestContext.httpMethod || (event.requestContext.http && event.requestContext.http.method))
		const customParser = this._getCustomParser()
		
		try {
			if (customParser) {
				await customParser(event)
			} else if (isLambdaPayload) {
				common.bodyParser(event)

				// if (!event.queryStringParameters) {
				// 	event.queryStringParameters = {}
				// }

				// if (!event.pathParameters) {
				// 	event.pathParameters = {}
				// }
			}
		} catch (error) {
			event.middlewareBodyParseError = 'Request event.body parse error!'
			common.error(error)
		}

		return event
	}

	_getCustomParser () {
		let result

		if (typeof this._options.bodyParser === 'function') {
			result = this._options.bodyParser
		} else if (typeof _globalOptions.bodyParser === 'function') {
			result = _globalOptions.bodyParser
		}

		return result
	}
}


module.exports = Middleware
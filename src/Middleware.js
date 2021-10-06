const common = require('./common')

let globalOptions = {}


class Middleware {

	/**
	 * set global options
	 * @param {Object} options
	 */
	static globalOption (options = {}) {
		if (common.isObject(options)) {
			globalOptions = options
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

	/** ========== Private Methods ========== */
	
	//lambda handler
	async _handler (event = {}, context = {}, callback) {
		const evt = this._parseEvent(event)
		const flowLength = this._flows.length
		let prevData = {}

		for (const i in this._flows) {
			const flow = this._flows[i]

			try {
				if (flow.type === 'handler') {
					prevData = await flow.handler(evt, context, prevData)
				} else {
					prevData = await this._validPropTypes(evt, flow.props)
				}

				//last flow callback
				if (flowLength - 1 == i) {
					callback(null, common.isObject(prevData) ? {
						...globalOptions.callbackData,
						...this._options.callbackData,
						...prevData
					} : prevData)

					break
				}
			} catch (error) {
				common.error(error)
				
				if (common.isError(error)) {
					callback(error)
				} else {
					callback(null, common.isObject(error) ? {
						...globalOptions.callbackData,
						...this._options.callbackData,
						...error
					} : error)
				}

				break
			}
		}
	}

	async _validPropTypes (event, propGroup) {
		let errorMsg = event.middlewareBodyParseError || ''

		if (!errorMsg && common.isObject(propGroup)) {
			for (const groupKey in propGroup) {
				const propTypeRules = propGroup[groupKey]

				for (const propName in propTypeRules) {
					const rule = propTypeRules[propName]
					const val = common.isObject(event[groupKey]) ? event[groupKey][propName] : undefined
					
					if (rule && typeof rule._invalid === 'function') {
						errorMsg = rule._invalid(propName, val)
					} else {
						errorMsg = 'You have set propTypes that are not supported.'
					}

					if (errorMsg) {
						break
					} else {
						//set value & convert
						if (common.isObject(event[groupKey])) {
							const hasProp = event[groupKey].hasOwnProperty(propName)

							if (common.isEmpty(val) && rule._default) {
								try {
									const defaultVal = await rule._default(propName, event)
									event[groupKey][propName] = defaultVal
								} catch (error) {
									errorMsg = error
									break
								}
							} else if (hasProp && !common.isEmpty(val) && typeof rule._convert === 'function') {
								event[groupKey][propName] = rule._convert(val)
							}
						}
					}
				}
			}
		}

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

	_parseEvent (event = {}) {
		/**
		 * Lambda payload 1.0 = event.requestContext.httpMethod
		 * Lambda payload 2.0 = event.requestContext.http.method
		 */
		if (event.requestContext && (event.requestContext.httpMethod || (event.requestContext.http && event.requestContext.http.method))) {
			try {
				if (typeof this._options.bodyParser === 'function') {
					this._options.bodyParser(event)
				} else if (typeof globalOptions.bodyParser === 'function') {
					globalOptions.bodyParser(event)
				} else {
					common.bodyParser(event)
				}
			} catch (error) {
				event.middlewareBodyParseError = 'Request event.body parse error!'
				common.error(error)
			}

			if (!event.queryStringParameters) {
				event.queryStringParameters = {}
			}

			if (!event.pathParameters) {
				event.pathParameters = {}
			}
		}

		return event
	}
}


module.exports = Middleware
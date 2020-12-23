const querystring = require('querystring')
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
			console.log('The globalOptions type is available only for objects.')
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
			console.log('The clusterOptions type is available only for objects.')
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
				console.error(error)
				
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
							const propValue = event[groupKey][propName]

							if (common.isEmpty(propValue) && !common.isEmpty(rule._default, true)) {
								event[groupKey][propName] = common.clone(rule._default)
							} else if (hasProp && propValue && typeof rule._convert === 'function') {
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
					if (event.body) {
						const contentType = common.getHeader(event, 'Content-Type')

						if (typeof event.body === 'string') {
							if (/application\/json/i.test(contentType)) {
								event.body = JSON.parse(event.body)
							} else if (/application\/x-www-form-urlencoded/i.test(contentType)) {
								event.body = {
									...querystring.parse(event.body)
								}
							}
						}
					} else {
						event.body = {}
					}
				}
			} catch (error) {
				event.middlewareBodyParseError = 'Request event.body parse error!'
				console.error(error)
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
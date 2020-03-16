const common = require('./common')

let globalOptions = {}


class Middleware {

	/**
	 * set global options
	 * @param {Object} options
	 */
	static globalOption (options = {}) {
		globalOptions = options
	}

	/**
	 * @param {Object} options	closer options
	 */
	constructor (options = {}) {
		this._options = options
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
		let errorMsg = ''

		if (common.isObject(propGroup)) {
			for (const groupKey in propGroup) {
				const propTypeRules = propGroup[groupKey]

				for (const propName in propTypeRules) {
					const rule = propTypeRules[propName]
					const val = common.isObject(event[groupKey]) ? event[groupKey][propName] : undefined
					
					errorMsg = rule._invalid(propName, val)

					if (errorMsg) {
						break
					} else {
						//value convert
						if (common.isObject(event[groupKey]) && typeof rule._convert === 'function') {
							event[groupKey][propName] = rule._convert(val)
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
		if (event.httpMethod) {
			if (event.body) {
				if (typeof event.body === 'string' && /^\{.*\}$/.test(event.body)) {
					event.body = JSON.parse(event.body)
				}
			} else {
				event.body = {}
			}

			if (!event.queryStringParameters) {
				event.queryStringParameters = {}
			}

			if (!event.pathParameters) {
				event.pathParameters = {}
			}
		}

		if (event.requestContext && event.requestContext.authorizer && common.isObject(event.requestContext.authorizer)) {
			for (let key in event.requestContext.authorizer) {
				event.requestContext.authorizer[key] = common.convertDataType(event.requestContext.authorizer[key])
			}
		}

		return event
	}
}


module.exports = Middleware
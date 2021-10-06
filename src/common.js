const { URLSearchParams } = require('url')


const Common = {
	isObject: (value) => {
		return Object.prototype.toString.call(value) === '[object Object]'
	},

	isEmpty: (value, isTypeData) => {
		let result = true

		if (Array.isArray(value)) {
			result = isTypeData ? false : value.length === 0
		} else if (Common.isObject(value)) {
			if (isTypeData) {
				result = false
			} else {
				result = true
				
				for (const key in value) {
					result = false
					break
				}
			}
		} else if (typeof value === 'boolean' || typeof value === 'number' || value) {
			result = false
		}

		return result
	},

	isError: (value) => {
		return /^\[[^\]]+Error\]$/.test(Object.prototype.toString.call(value))
	},

	/**
	 * get header
	 * @param {Object}	event
	 * @param {String}	propName	event.header propName, ex)"Content-Type"
	 * @returns {*}
	 */
	getHeader: (event = {}, propName) => {
		return Common.isObject(event.headers) ? event.headers[propName] || event.headers[propName.toLowerCase()] : undefined
	},

	/**
	 * Deep clone
	 * @param {*} value 
	 * @returns {*}
	 */
	clone: (value) => {
		let result;

		if (Array.isArray(value) || Common.isObject(value)) {
			result = (Array.isArray(value)) ? [] : {}

			for (const key in value) {
				result[key] = Common.clone(value[key])
			}
		} else {
			result = value
		}

		return result
	},

	error: (...arg) => {
		console.error('[aws-lambda-middleware]', ...arg)
	},

	bodyParser: (event) => {
		if (event.body) {
			const contentType = Common.getHeader(event, 'Content-Type')

			if (typeof event.body === 'string') {
				if (/application\/json/i.test(contentType)) {
					event.body = JSON.parse(event.body)
				} else if (/application\/x-www-form-urlencoded/i.test(contentType)) {
					const params = {}
					const searchParams = new URLSearchParams(event.body)
					searchParams.sort()

					/**
					 * suported array format
					 * foo=1&foo=2&foo=3
					 * foo[]=
					 * foo[]=1&foo[]=2&foo[]=3
					 * foo[0]=1&foo[1]=2&foo[3]=3
					 */
					for (const [propName, value] of searchParams) {
						if (/([^\[\]]+)([\[\]0-9]+)/i.test(propName)) {
							const name = RegExp.$1
							// const aryStr = RegExp.$2

							if (!params.hasOwnProperty(name)) {
								params[name] = []
							}

							paramsToArray(params, name, value)
						} else {
							//array
							if (params.hasOwnProperty(propName)) {
								paramsToArray(params, propName, value)
							} else {
								params[propName] = value
							}
						}
					}

					event.body = {
						...params
					}
				}
			}
		} else {
			event.body = {}
		}
	}
}


function paramsToArray (params, propName, value) {
	if (Array.isArray(params[propName])) {
		params[propName].push(value)
	} else {
		params[propName] = [params[propName], value]
	}
}


module.exports = Common
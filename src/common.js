const { URLSearchParams } = require('url')


const Common = {
	RESERVED_PROPS: Object.freeze([
		'addRules', 'makeRule', 'isEmpty', 'default', 'isRequired', 'option', 'array', 'object',
		'required', 'valid', 'item', 'items'
	]),

	isObject: (value) => {
		return Object.prototype.toString.call(value) === '[object Object]' && !(value && value._isRule)
	},

	isNumber: (value) => {
		return typeof value === 'number'
	},

	isEmpty: (value, isTypeData) => {
		let result = true

		if (Array.isArray(value)) {
			result = isTypeData ? false : !value.length
		} else if (Common.isObject(value)) {
			if (isTypeData) {
				result = !value
			} else {
				result = !(value && Object.keys(value).length)
			}
		} else if (typeof value === 'number') {
			result = isNaN(value)
		} else if (typeof value === 'boolean') {
			result = false
		} else {
			result = !value
		}

		return result
	},

	isError: (value) => {
		return /^\[[^\]]+Error\]$/.test(Object.prototype.toString.call(value))
	},

	//Object, Array, String, Number, NaN, Null, Function, Date, Boolean, RegExp, Error, Undefined
	type: (value, lowerCase) => {
		let result = Object.prototype.toString.call(value)
		result = result.match(/^\[\W*object\W+([a-zA-Z]+)\W*\]$/)

		if (result && result.length > 1) {
			result = result[1]
		}

		if (result === 'Number') {
			if (isNaN(value)) {
				result = 'NaN'
			}
		} else if (result === 'Object') {
			if (undefined === value) {
				result = 'Undefined'
			} else if (null === value) {
				result = 'Null'
			}
		}

		return lowerCase ? result.toLowerCase() : result
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
		let result

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

	info: (...arg) => {
		console.info('[aws-lambda-middleware]', ...arg)
	},

	warn: (...arg) => {
		console.warn('[aws-lambda-middleware]', ...arg)
	},

	error: (...arg) => {
		console.error('[aws-lambda-middleware]', ...arg)
	},

	/**
	 * QueryString parser
	 * suported array format
	 * foo=1&foo=2&foo=3
	 * foo[]=
	 * foo[]=1&foo[]=2&foo[]=3
	 * foo[0]=1&foo[1]=2&foo[3]=3
	 * foo[age]=20&foo[name]=jim
	 * @param {String}	queryString
	 * @returns {Object}
	 */
	queryParser: (queryString) => {
		const params = {}

		if (typeof queryString === 'string' && queryString.length) {
			const searchParams = new URLSearchParams(queryString)
			searchParams.sort()

			for (const [propName, value] of searchParams) {
				const match = Common.matchProp(propName)

				if (match) {
					const name = match.name
					const depthAry = match.value.match(/\[[^\[\]]*\]/g)
					const depthLength = depthAry.length
					
					//depth 1 limit
					if (depthLength === 1) {
						for (let i = 0; i < depthLength; ++i) {
							const key = depthAry[i].replace(/[\[\]]/g, '')

							if (key && /[^0-9]+/.test(key)) {
								//object
								if (!Object.hasOwn(params, name)) {
									params[name] = {}
								}

								params[name][key] = value
							} else {
								//array
								if (!Object.hasOwn(params, name)) {
									params[name] = []
								}

								params[name].push(value)
							}
						}
					}
				} else {
					//array
					if (Object.hasOwn(params, propName)) {
						if (Array.isArray(params[propName])) {
							params[propName].push(value)
						} else {
							params[propName] = [params[propName], value]
						}
					} else {
						params[propName] = value
					}
				}
			}
		}

		return params
	},

	bodyParser: (event) => {
		if (event.body) {
			const contentType = Common.getHeader(event, 'Content-Type')

			if (typeof event.body === 'string') {
				if (/application\/json/i.test(contentType)) {
					event.body = JSON.parse(event.body)
				} else if (/application\/x-www-form-urlencoded/i.test(contentType)) {
					event.body = Common.queryParser(event.body)
				}
			}
		} else {
			event.body = {}
		}
	},

	/**
	 * @param {String} propName 
	 * @returns {Object}	{ name, value } || null
	 */
	matchProp (propName) {
		const matchAry = propName.match(/([^\[\]]+)(\[.*\])/i)

		if (matchAry?.length) {
			return {
				name: matchAry[1],
				value: matchAry[2],
			}
		} else {
			return null
		}
	}
}


module.exports = Object.freeze(Common)
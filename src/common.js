
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
				result = true;
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
	}
}

module.exports = Common

const Common = {
	isObject: (value) => {
		return Object.prototype.toString.call(value) === '[object Object]'
	},

	isEmpty: (value) => {
		let result = true

		if (Array.isArray(value)) {
			result = value.length === 0
		} else if (Common.isObject(value)) {
			result = true;
			for (const key in value) {
				result = false
				break
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
}

module.exports = Common
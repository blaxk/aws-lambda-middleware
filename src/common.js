
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

	convertDataType: (str) => {
		if (str && typeof str === 'string') {
			if (/^true$/.test(str)) {
				str = Boolean(str)
			} else if (/^false$/.test(str)) {
				str = Boolean()
			} else if (/^-*[0-9\.]+$/.test(str)) {
				str = str.replace(/\s/g, '')

				if (!/^0[0-9]+/.test(str) && !/^-0[0-9]+/.test(str) && !(str.length === 1 && str === '-')) {
					str = Number(str)
				}
			} else if (/^null$/.test(str)) {
				str = null
			} else if (/^undefined$/.test(str)) {
				str = undefined
			}
		}

		return str
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
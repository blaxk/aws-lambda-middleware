const common = require('./common')
const _templates = {
	'param-required': `'{{propName}}' is a required parameter`,
	'param-invalid-type': `'{{propName}}' is a parameter in an invalid type`,

	'error-default-func': `'{{propName}}' default function execution error`,
	'error-default-value': `'{{propName}}' default value type error`,

	'validate-invalid-func': `'{{propName}}' is an invalid value`,
	'validate-default-invalid': `value of '{{propName}}' invalid`
}


const Message = {
	/**
	 * Supported Variables: (propName, value)
	 * @param {String}	templateKey
	 * @param {String}	template
	 */
	setTemplate (templateKey, template) {
		if (templateKey && template && typeof templateKey === 'string' && typeof template === 'string') {
			_templates[templateKey] = template
		}
	},

	getTemplate (templateKey) {
		return _templates[templateKey]
	},

	/**
	 * templateKey to message string
	 * @param {String} templateKey 
	 * @param {Object} data 
	 * @returns {String}
	 */
	getMessage (templateKey, data) {
		const template = Message.getTemplate(templateKey)

		if (template) {
			return Message.toMessage(template, data)
		} else {
			return ''
		}
	},

	/**
	 * message template to message string
	 * @param {String} template 
	 * @param {Object} data 
	 * @returns {String}
	 */
	toMessage (template, data, repeatCount = 0) {
		const reg = /\{\{\#(unless|less)[\s]*([^\{\}\/\#]+)[\s]*\}\}([^\}\{\}]*)\{\{\/(unless|less)\}\}/gm
		let result = ''

		if (template) {
			result = template.replace(/\{\{([\w]+)\}\}/gm, (str, propName) => {
				return Object.hasOwn(data, propName) ? data[propName] : ''
			}).replace(reg, (str, helper, propName, el) => {
				const val = Object.hasOwn(data, propName) ? data[propName] : ''

				if (helper === 'unless') {
					return !common.isEmpty(val, true) ? el : ''
				} else {
					return common.isEmpty(val, true) ? el : ''
				}
			})

			if (reg.test(result) && repeatCount < 5) {
				result = Message.toMessage(result, data, ++repeatCount)
			}
		}

		return result
	}
}


module.exports = Object.freeze(Message)
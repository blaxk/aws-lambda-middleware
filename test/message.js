const Message = require('../src/Message')

console.log(
	'---------->\n',
	Message.toMessage(
		`
		unless: "{{#unless option}}inner string{{/unless}}"
		unless-empty: "{{#unless option}}{{/unless}}"
		unless-forbidden: "{{#unless option}} 1} title {/unless}}"
		unless-param: "{{#unless option}}{{option}}{{/unless}}"
		less: "{{#less option}}less value{{/less}}"
		complex: "{{#unless max1}}{{max1}}, {{#less max2}}less max2 value{{/less}}{{/unless}}"
		params: "{{max}}, {{option}}"
		`,
		{
			propName: 'prop name',
			option: 'option value',
			max1: 'max value'
		}
	),
	'\n<----------'
)


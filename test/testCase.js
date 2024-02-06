const { Middleware, PropTypes, Prop, Validate } = require('../index')


/**
{
	body: {
		serviceType: 1,
		product: {
			productId: 1,
			images: ['aaa.jpg'],
			options: [
				{
					optionId: 2,
					images: []
				}
			]
		}
	}
}
 */
const handler = new Middleware({
	trim: true
}).add({
	body: {
		title: Prop.string.option({ trim: false }).length({ max: 10 }),
		username: Prop.string.required((sibling) => !sibling.title),
		stores: Prop.array.default([]),
		//object - default
		productDefault: Prop.object.required().item({
			productId: Prop.integer.required(),
			images: Prop.array.default([]),
			options: Prop.array.item([
				Prop.object.required().item({
					optionId: Prop.integer.required()
				})
			])
		}),

		//object - simple
		productSimple: {
			productId: Prop.integer.required(),
			images: [Prop.string],
			options: [{
				optionId: Prop.integer.required((sibling) => sibling.serviceType == 1)
			}]
		},

		//Return item dynamically
		productSimple3: Prop.object.required().item((sibling) => (sibling.serviceType == 1 ? {
			productId: Prop.integer.required(),
			images: [Prop.string]
		} : {
			productId: Prop.integer.required(),
			images: [Prop.string]
		}))
	},
	queryStringParameters: {
		storeId: Prop.integer
	}
}).valid({
	body: {
		title: ' aaa test'
	}
})

console.log('===== Result ===>', handler)


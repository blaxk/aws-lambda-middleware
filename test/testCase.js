const { Middleware, PropTypes, Prop, Validate } = require('../index')

Middleware.globalOption({
	// pathPropNameType: 'simple',
	ignoreFirstPathPropNames: ['body', 'queryStringParameters', 'pathParameters']
})



const middleware = new Middleware({
	trim: true
}).add({
	body: {
		title: Prop.string.length({ max: 5 }),
		username: Prop.string.required(({ s }) => !s.title),
		stores: Prop.array.default([]),
		
		//object - default
		// productDefault: Prop.object.required().item({
		// 	productId: Prop.integer.required(),
		// 	images: Prop.array.default([]),
		// 	options: Prop.array.item([
		// 		Prop.object.required().item({
		// 			optionId: Prop.integer.required()
		// 		})
		// 	])
		// }),

		//object - simple
		productDefault: {
			productId: Prop.integer.required(),
			images: Prop.array.default([]),
			options: [
				{
					optionId: Prop.integer.required()
				}
			]
		},

		// //Return dynamically item
		// productSimple3: Prop.object.required().item(({ s }) => (s.optionType ? {
		// 	productId: Prop.integer.required(),
		// 	images: [Prop.string]
		// } : {
		// 	productId: Prop.integer.required(),
		// 	images: [Prop.string]
		// }))
	},
	queryStringParameters: Prop.object.default({}).item({
		storeId: Prop.integer
	})
}).add(async (event, context, prevData) => {
	console.log('==> event:', event)

	return {
		statusCode: 200,
		body: JSON.stringify({
			message: 'success'
		})
	}
})

//middleware(event, context, callback)
middleware({
	body: {
		test: 1,
		title: ' title   ',
		productDefault: {
			productId: 11,
			options: [
				{
					optionId: 111
				}
			]
		}
	},
	// queryStringParameters: {

	// }
}, {}, (err, callbackData) => {
	console.log('==err:', err)
	// console.log('==callbackData:', callbackData)
})


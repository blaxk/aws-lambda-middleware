const { Middleware, Prop } = require('../index')

Middleware.globalOption({
	// pathPropNameType: 'simple',
	ignoreFirstPathPropNames: ['body', 'queryStringParameters', 'pathParameters']
})


const middleware = new Middleware({
	trim: true
}).add({
	title: Prop.string.required().length({ max: 10 }),
	body: {
		storeId: Prop.integer.isRequired,
		images: [
			Prop.string.required(),
			Prop.bool.required()
		],
		product: {
			productId: Prop.integer.required(),
			photos: Prop.array.item([
				Prop.string.or((v, s, e) => e.body.storeId === 23 ? ['aa', 'bb'] : ['cc', 'dd'])
			]).length({ max: 2 })
		}
	}
})

console.log('===> result.valid:', middleware.valid({
	title: 'aaa',
	body: {
		storeId: '24',
		images: ['3', true, 'qq'],
		product: {
			productId: 1,
			photos: ['bb', 'aa']
		}
	}
}))

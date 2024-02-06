const { Middleware, Prop } = require('../index')

Middleware.globalOption({
	pathPropNameType: 'simple',
	ignoreFirstPathPropNames: ['body']
})


const result = new Middleware({
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
				Prop.string.or(['aa', 'bb'])
			]).length({ max: 2 })
		}
	}
})

console.log('===> result.valid:', result.valid({
	title: 'aaa',
	body: {
		storeId: '23',
		images: ['3', true, 'qq'],
		product: {
			productId: 1,
			photos: ['aa', 'bcb']
		}
	}
}))

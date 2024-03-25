const { Middleware, Prop } = require('../index')

Middleware.globalOption({
	// pathPropNameType: 'simple',
	ignoreFirstPathPropNames: ['body', 'queryStringParameters', 'pathParameters']
})


const middleware = new Middleware({
	trim: true
}).add({
	bookName: Prop.string.required(),
	title: Prop.string.required().length({ max: 10 }),
	age: Prop.integer.max(10),
	body: {
		storeId: Prop.integer.isRequired,
		images: [
			Prop.string.required(),
			Prop.bool.required()
		],
		anyList: [
			[
				Prop.string,
				Prop.integer
			],
			{
				id: Prop.integer.required()
			}
		],
		list: [
			{
				id: Prop.integer.required()
			},
			{
				id: Prop.string.required()
			},
			[
				Prop.string
			]
		],
		product: {
			productId: Prop.integer.required(),
			photos: Prop.array.item([
				Prop.string.or(({ v, s, e }) => e.body.storeId === 23 ? ['aa', 'bb'] : ['cc', 'dd'])
			]).length({ max: 2 })
		}
	}
})

console.log('===> result.valid1:', middleware.valid({
	title: 'aaa',
	age: 20,
	body: {
		storeId: '24',
		anyList: [
			[`1`, 2],
			{
				id: 123
			}
		]
	}
}))


console.log('===> result.valid2:', middleware.valid({
	title: 'aaa',
	body: {
		storeId: '24',
		anyList: [
			[`1`, 2],
			{
				id: 123
			}
		],
		list: [
			{ id: 20 },
			{ id: `aaa` },
			[]
		],
		images: ['3', true, 'qq'],
		product: {
			productId: 1,
			photos: ['bb', 'aa']
		}
	}
}))
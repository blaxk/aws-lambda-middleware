const { Middleware, PropTypes } = require('../index')


Middleware.globalOption({
	callbackData: {
		headers: { 'Access-Control-Allow-Origin': '*' }
	}
})

PropTypes.addRules({
	get date () {
		return PropTypes.makeRule({
			validType: (value) => {
				return !!(typeof value === 'string')
			},
			validRequired: (value) => {
				return !!value
			}
		})
	}
})


const handler1 = new Middleware().add({
	body: {
		username: PropTypes.string.isRequired,
		photos: PropTypes.array.default((event) => [Date.now()])
	}
}).add(async (event, context, prevData) => {
	//converted data type body
	const body = event.body

	console.log('-body:', body)

	return {
		statusCode: 200,
		body: JSON.stringify({
			message: 'success'
		})
	}
})


const handler2 = new Middleware({
	callbackData: {
		headers: { 'Access-Control-Allow-Origin': '*' }
	}
}).add({
	queryStringParameters: {
		username: PropTypes.string.isRequired,
		age: PropTypes.integer
	}
}).add(async (event, context, prevData) => {
	//converted data type body
	const query = event.queryStringParameters

	if (query.age > 20) {
		return {
			myName: 'jone'
		}
	} else {
		return Promise.reject({
			statusCode: 404,
			body: JSON.stringify({
				message: 'not found'
			})
		})
	}
}).add(async (event, context, prevData) => {
	console.log(prevData.myName) // 'jone'

	return {
		statusCode: 200,
		body: JSON.stringify({
			myName: prevData.myName
		})
	}
})


const handler3 = new Middleware().add(async (event, context, prevData) => {
	if (event.source === 'serverless-plugin-warmup') {
		return Promise.reject('Lambda is warm!')
	}
}).add({
	body: {
		username: PropTypes.string.isRequired
	}
}).add(async (event, context, prevData) => {
	//code

	return {
		statusCode: 200,
		body: JSON.stringify({
			message: 'success'
		})
	}
})



/** ========== Run Handler ========== */

const palyload1 = {
	version: '1.0',
	resource: '/my/path',
	path: '/my/path',
	httpMethod: 'GET',
	headers: {
		'Content-Type': 'application/x-www-form-urlencoded',
		'Header2': 'value2'
	},
	multiValueHeaders: {
		'Header1': ['value1'],
		'Header2': ['value1', 'value2']
	},
	queryStringParameters: { username: 'value1', parameter2: 'value' },
	multiValueQueryStringParameters: { parameter1: ['value1', 'value2'], paramter2: ['value'] },
	requestContext: {
		accountId: '123456789012',
		apiId: 'id',
		authorizer: { claims: null, scopes: null },
		domainName: 'id.execute-api.us-east-1.amazonaws.com',
		domainPrefix: 'id',
		extendedRequestId: 'request-id',
		httpMethod: 'GET',
		identity: {
			accessKey: null,
			accountId: null,
			caller: null,
			cognitoAuthenticationProvider: null,
			cognitoAuthenticationType: null,
			cognitoIdentityId: null,
			cognitoIdentityPoolId: null,
			principalOrgId: null,
			sourceIp: 'IP',
			user: null,
			userAgent: 'user-agent',
			userArn: null
		},
		path: '/my/path',
		protocol: 'HTTP/1.1',
		requestId: 'id=',
		requestTime: '04/Mar/2020:19:15:17 +0000',
		requestTimeEpoch: 1583349317135,
		resourceId: null,
		resourcePath: '/my/path',
		stage: '$default'
	},
	pathParameters: null,
	stageVariables: null,
	body: 'username=testname&photos[]=',
	isBase64Encoded: true
}

const palyload2 = {
	version: '2.0',
	routeKey: '$default',
	rawPath: '/my/path',
	rawQueryString: 'parameter1=value1&parameter1=value2&parameter2=value',
	cookies: ['cookie1', 'cookie2'],
	headers: {
		'Header1': 'value1',
		'Header2': 'value2'
	},
	queryStringParameters: { parameter1: 'value1,value2', parameter2: 'value' },
	requestContext: {
		accountId: '123456789012',
		apiId: 'api-id',
		authorizer: {
			jwt: {
				claims: { 'claim1': 'value1', 'claim2': 'value2' },
				scopes: ['scope1', 'scope2']
			}
		},
		domainName: 'id.execute-api.us-east-1.amazonaws.com',
		domainPrefix: 'id',
		http: {
			method: 'POST',
			path: '/my/path',
			protocol: 'HTTP/1.1',
			sourceIp: 'IP',
			userAgent: 'agent'
		},
		requestId: 'id',
		routeKey: '$default',
		stage: '$default',
		time: '12/Mar/2020:19:03:58 +0000',
		timeEpoch: 1583348638390
	},
	body: 'foo=1&foo=2&foo=3',
	pathParameters: { 'parameter1': 'value1' },
	isBase64Encoded: false,
	stageVariables: { 'stageVariable1': 'value1', 'stageVariable2': 'value2' }
}




handler1(palyload1, {

}, (err, callbackData) => {
		//callback
		console.log('==err:', err)
		console.log('==callbackData:', callbackData)
})

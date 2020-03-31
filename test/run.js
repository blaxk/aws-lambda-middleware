const { Middleware, PropTypes } = require('../index')


Middleware.globalOption({
	callbackData: {
		headers: { 'Access-Control-Allow-Origin': '*' }
	}
})



const handler1 = new Middleware().add({
	body: {
		username: PropTypes.string.isRequired
	}
}).add(async (event, context, prevData) => {
	//converted data type body
	const body = event.body

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

handler1({
	"resource": "/users/create",
	"source": "serverless-plugin-warmup",
	"path": "/users/create",
	"httpMethod": "GET",
	"headers": {
		"User-Agent": "PostmanRuntime/7.6.0",
		"X-Forwarded-For": "175.211.38.132",
		"Content-Type": "application/json",
	},
	"queryStringParameters": {
		"username": "test"
	},
	"multiValueQueryStringParameters": null,
	"pathParameters": {
		"username": "test"
	},
	"stageVariables": null,
	"requestContext": {
		"authorizer": {
			"username": "testId",
			"userId": 12
		},
		"path": "/users/create",
		"accountId": "758726136398",
		"resourceId": "n4ey2n",
		"stage": "dev",
		"domainPrefix": "testPrefix",
		"domainName": "testPrefix.testDomainName",
		"resourcePath": "/users/create",
		"httpMethod": "GET",
		"extendedRequestId": "VwTpXHDCoE0FV7w=",
		"apiId": "bunx7zc1c6"
	},
	"body": "{\"username\":\"1\"}",
	"isBase64Encoded": false
}, {

}, (err, callbackData) => {
		//callback
		console.log('==err:', err)
		console.log('==callbackData:', callbackData)
})
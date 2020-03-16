# aws-lambda-middleware

#### AWS Lambda Middleware  
Lambda 에서 심플하게 Middleware를 적용할 수 있다.     
깔끔한 코드분할이 가능하며, 간단하면서 확장성 있는 Parameter PropTypes validater 를 포함하고 있다.

&nbsp;

## Install

```bash
npm i aws-lambda-middleware
```
&nbsp;

## Quick setting
```js
const { Middleware, PropTypes } = require('aws-lambda-middleware')


exports.handler = new Middleware().add({
	queryStringParameters: {
		username: PropTypes.string.isRequired,
		age: PropTypes.integer
	}
}).add(async (event, context, prevData) => {
	const query = event.queryStringParameters

	//your code

	return {
		statusCode: 200,
		body: JSON.stringify({
			message: 'success'
		})
	}
})
```

&nbsp;

## Options
global option과 cluster option을 설정할수 있다.   
설정의 우선순위는 `globalOption < clusterOption < callbackData`   

**callbackData:** *{Object}*	callback 시 공통으로 적용되는 data

```js
const { Middleware, PropTypes } = require('aws-lambda-middleware')

Middleware.globalOption({
	callbackData: {
		headers: { 'Access-Control-Allow-Origin': '*' }
	}
})
```

각 Middleware 별로 cluster option을 적용할수도 있다.
```js
const { Middleware, PropTypes } = require('aws-lambda-middleware')

exports.handler = new Middleware({
	callbackData: {
		headers: { 'Access-Control-Allow-Origin': '*' }
	}
})
```

&nbsp;

## Middleware

### Middleware
> constructor

| Param | Type | Description |
| --- | --- | --- |
| clusterOption | *Object* | middleware options |

### add(handler) : *{Middleware}*
> Flow handler & ProType rules 추가

| Param | Type | Description |
| --- | --- | --- |
| handler | *Function* | @param *{Object}* `event`	Lambda event (converted data type)<br>@param *{Object}* `context`	Lambda context<br>@param *{Object}* `prevData`	Previous handler return data|
| handler | *Object* | PropTypes rules |

```js
exports.handler = new Middleware().add(async (event, context, prevData) => {
	if (event.source === 'serverless-plugin-warmup') {
		//Promise.reject() 을 리턴하면 next handler 를 실행하지 않고 Lambda handler callback(null, rejectValue)
		return Promise.reject('Lambda is warm!')
	}
}).add({
	//PropTypes는 첫번째 flow로 등록(add)하지 않아도 된다, 필요한 위치에 등록한다.
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
```

&nbsp;

## PropTypes

Parameter PropTypes validater   
기본 지원하는 type은 아래와 같다.

### Support Types

| Type | Description |
| --- | --- |
| string | String |
| number | Number or Numberic string |
| integer | Integer or Integeric string |
| bool | Boolean or Boolean string |
| array | Array, isRequired = array.length > 0 |

```js
exports.handler = new Middleware().add({
	//체크할 Lambda event의 자식요소 Property name (queryStringParameters, body, pathParameters ...)
	queryStringParameters: {
		//Type + Required
		username: PropTypes.string.isRequired,
		//Only Type (값이 없을때는 체크하지 않는다.)
		age: PropTypes.integer
	}
})
```

### addRules(rules)
> 기본 제공하는 rules 이외에 rule을 추가할 수 있다.   
> 기존과 같은 type name으로 등록하면 기존 rule을 대체한다.   
> 해당 설정은 global로 적용된다.

| Param | Type | Description |
| --- | --- | --- |
| rules | *Object* | - |

```js
const { Middleware, PropTypes } = require('aws-lambda-middleware')

PropTypes.addRules({
	//기존 string rule을 대체한다.
	get string () {
		return PropTypes.makeRule({
			//Data type을 체크할 valid function
			validType: (value) => {
				return typeof value === 'string'
			},
			//Required를 체크할 valid function
			validRequired: (value) => {
				return value.length > 0
			},
			//Paramers 의 value가 String 으로 잘못 변환되어 들어 오는 경우 변환시키는 function (필요시에만 적용한다.)
			convert: (value) => {
				return String(value)
			}
		})
	},

	//여러개 설정가능
	get number () {
		return PropTypes.makeRule({
			validType: (value) => {
				return ...
			},
			validRequired: (value) => {
				return ...
			},
			convert: (value) => {
				return ...
			}
		})
	}
})
```

&nbsp;

## Node Version Compatibility
Node.js ^8.3.0



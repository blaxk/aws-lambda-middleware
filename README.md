# aws-lambda-middleware

[![NPM version](https://img.shields.io/npm/v/aws-lambda-middleware.svg)](https://www.npmjs.com/package/aws-lambda-middleware)
[![NPM downloads](https://img.shields.io/npm/dm/aws-lambda-middleware.svg)](https://www.npmjs.com/package/aws-lambda-middleware)

#### AWS Lambda Middleware  
You can simply apply Middleware in Lambda.       
Clean code split is possible, and it includes a simple and extensible Parameter PropTypes validater.  
It is implemented as lightly as possible to reduce the burden when running Lambda.   
> Lambda Payload 2.0 supported.

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
      age: PropTypes.integer,
      photos: PropTypes.array.default([])
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
You can set global options and cluster options.   
Setting priority is `globalOption < clusterOption < callbackResult`   

### callbackData: *{Object}*	
> Common data applied during callback

```js
const { Middleware, PropTypes } = require('aws-lambda-middleware')

Middleware.globalOption({
  callbackData: {
    headers: { 'Access-Control-Allow-Origin': '*' }
  }
})
```

### bodyParser: *{Function}*	
> Common event.body parser   

Currently, event.body parser supports `Content-Type` : `application/json`, `application/x-www-form-urlencoded`.    
The query string parser supports the following formats (application/x-www-form-urlencoded):
```
'foo=1&foo=&foo=3&name=jim&profile[age]=20'
'foo[]=1&foo[]=&foo[]=3&name=jim&profile[age]=20'
'foo[2]=3&foo[1]=&foo[0]=1&name=jim&profile[age]=20'
'foo[2]=3&foo[1]=&foo[0]=1&name=jim&profile[age]=20'

//only parse up to 2 depth
//return { foo: [ '1', '', '3' ], name: 'jim', profile: { age: '20' } }
```  
If you want to use another type of body parser, you can apply it at this point.

```js
const { Middleware, PropTypes, common } = require('aws-lambda-middleware')
const qs = require('qs')

Middleware.globalOption({
  bodyParser: (event = {}) => {
    const contentType = common.getHeader(event, 'Content-Type')
    
    if (/application\/x-www-form-urlencoded/i.test(contentType)) {
        event.body = qs.parse(event.body)
    }
  }
})
```

Cluster option can be applied to each middleware.
```js
const { Middleware, PropTypes } = require('aws-lambda-middleware')

exports.handler = new Middleware({
  callbackData: {
    headers: { 'Access-Control-Allow-Origin': '*' }
  },
  bodyParser: (event = {}) => {
    //code
  },
  trim: true
})
```

### trim: *{Boolean}*	
> When the Trim option is set, whitespaces are removed from both ends of the parameter string.   

The trim option can be applied in three forms.
```js
const { Middleware, PropTypes } = require('aws-lambda-middleware')

//Apply trim to all parameters for which PropType is set
Middleware.globalOption({
  trim: true
})

//Trim option is applied per handler function
exports.handler = new Middleware({
  trim: true
}).add({
  queryStringParameters: {
    username: PropTypes.string.isRequired,
    //Apply trim to each parameter (highest priority)
    age: {
        propType: PropTypes.integer,
        trim: false
    }
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
> Add Flow handler & ProType rules

| Param | Type | Description |
| --- | --- | --- |
| handler | *Function* | @param *{Object}* `event`	Lambda event (converted data type)<br>@param *{Object}* `context`	Lambda context<br>@param *{Object}* `prevData`	Previous handler return data|
| handler | *Object* | PropTypes rules |
<br/>

```js
exports.handler = new Middleware().add(async (event, context, prevData) => {
  if (event.source === 'serverless-plugin-warmup') {
    //If Promise.reject() is returned, execute Lambda handler callback(null, rejectValue) without executing next handler
    return Promise.reject('Lambda is warm!')
  }
}).add({
  //PropTypes do not need to be added as a first flow
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


#### Example

```js
exports.handler = new Middleware().add({
  queryStringParameters: {
    age: PropTypes.integer.isRequired
  },
  pathParameters: {
    groupId: PropTypes.integer.isRequired
  }
}).add(async (event, context, prevData) => {
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
  const pathParam = event.pathParameters

  console.log(prevData.myName) // 'jone'

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

### Support Types

| Type | Description |
| --- | --- |
| string | String |
| number | Number or Numberic string |
| integer | Integer or Integeric string |
| bool | Boolean or Boolean string |
| array | Array, isRequired = array.length > 0 |
| object | Object, isRequired = Object.length > 0 |
<br/>

```js
exports.handler = new Middleware().add({
  //Validate child property of Lambda event (queryStringParameters, body, pathParameters ...)
  queryStringParameters: {
    //Type + Required
    username: PropTypes.string.isRequired,
    //Only Type (Do not check when there is empty value)
    age: PropTypes.integer,
    //Type + Set the value that is replaced when the request value is empty
    photos: PropTypes.array.default([]),
    //The value returned by the function can be set as the default value.
    startTime: PropTypes.number.default(event => Date.now())
  }
})
```

### addRules(rules)
> In addition to the basic rules, new rules can be added.   
> Adding with the same type name overrides the existing rule.   
> This setting is applied globally.

| Param | Type | Description |
| --- | --- | --- |
| rules | *Object* | - |
<br/>

```js
const { Middleware, PropTypes } = require('aws-lambda-middleware')

PropTypes.addRules({
  //It overrides the existing string rule.
  get number () {
    return PropTypes.makeRule({
        /**
         * Valid function to check data type
         * @param {*}		value
         * @param {Boolean}	isDefaultValue	 Returns true when validating the value type set as the default.
         * */
        validType: (value, isDefaultValue) => {
          if (!isDefaultValue && typeof value === 'string') {
            return /^-*[0-9]*[\.]*[0-9]+$/.test(value) && !/^0[0-9]+/.test(value) && !/^-0[0-9]+/.test(value) && !(value.length === 1 && value === '-')
          } else {
            return typeof value === 'number'
          }
        },
        //Valid function to check if it is required
        validRequired: (value) => {
          return !isNaN(value)
        },
        //A function that converts the value of Paramers when it is incorrectly converted to a string. (Set only when necessary)
        convert: (value) => {
          if (typeof value === 'string') {
            return Number(value)
          } else {
            return value
          }
        }
    })
  },

  //Multiple settings are possible at once
  get string () {
    return PropTypes.makeRule({ 
        validType: (value, isDefaultValue) => {
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

&nbsp;

## Changelog

#### 0.9.1
- Added trim option
- Fixed a bug where "convert" was not executed when applying PropTypes.*.default

#### 0.8.4
- PropTypes.*.default, Added ability to set the value returned from a method as a default value.
- Validate value type set as default
- Fixed a bug PropTypes.addRules
- body parser improvements

#### 0.7.1
- Added PropTypes.*.default method
- Added PropTypes.object

#### 0.6.1
- Lambda Payload 2.0 support
- Added Lambda error log

#### 0.5.3
- Fixed a bug PropTypes.boo.isRequired

#### 0.5.2
- Added and modify body parser options

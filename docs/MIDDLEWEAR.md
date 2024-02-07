# Middleware
You can simply apply Middleware in Lambda.  

## Middleware
> constructor

| Param | Type | Description |
| --- | --- | --- |
| clusterOption | *Object* | middleware options |

### add(handler) : *`{Middleware}`*
> Add Flow handler & ProType rules

| Param | Type | Description |
| --- | --- | --- |
| handler | *Function* | @param *{Object}* `event`	Lambda event (converted data type)<br>@param *{Object}* `context`	Lambda context<br>@param *{Object}* `prevData`	Previous handler return data|
| handler | *Object* | PropTypes rules |

```js
exports.handler = new Middleware().add(async (event, context, prevData) => {
  if (event.source === 'serverless-plugin-warmup') {
    //If Promise.reject() is returned, execute Lambda handler callback(null, rejectValue) without executing next handler
    return Promise.reject('Lambda is warm!')
  }
}).add({
  //PropTypes do not need to be added as a first flow
  body: {
    username: Prop.string.required()
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

### handler(handler) : *`{Middleware}`*
> Unlike "add" method, you can use lambda’s default callback.

| Param | Type | Description |
| --- | --- | --- |
| handler | *Function* | @param *{Object}* `event`	Lambda event (converted data type)<br>@param *{Object}* `context`	Lambda context<br>@param *{Funtion}* `callback`	Lambda callback |



### valid(requestData) : *`{Object}`*
> Returns the verification results of PropTypes and Validate request data.

| Param | Type | Description |
| --- | --- | --- |
| requestData | *Object* | PropTypes rules |

```js
const middleware = new Middleware().add({
  body: {
    username: Prop.string.required().length({ max: 10 })
  }
}).valid({
  body: {
    username: 'jamson'
  }
})

/**
 * @returns {Object}
 *  - {String}  status    none, valid, invalid, error
 *  - {String}  message   error message
 */
```
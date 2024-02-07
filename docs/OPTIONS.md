# Options

You can set global options and cluster options.   
Setting priority is `globalOption < clusterOption < prop option < callbackResult`   

&nbsp;

### trim: *`{Boolean}`*	
> When the Trim option is set, whitespaces are removed from both ends of the parameter string.   

The trim option can be applied in three forms.
```js
const { Middleware, Prop } = require('aws-lambda-middleware')

//Apply trim to all parameters for which PropType is set
Middleware.globalOption({
  trim: true
})

//Trim option is applied per handler function
exports.handler = new Middleware({
  trim: true
}).add({
  queryStringParameters: {
    username: Prop.string.required(),
    //Apply trim to each parameter (highest priority)
    age: Prop.integer.option({ trim: false })
  }
})
```


### callbackData: *`{Object}`*	
> Common data applied during callback

```js
const { Middleware } = require('aws-lambda-middleware')

Middleware.globalOption({
  callbackData: {
    headers: { 'Access-Control-Allow-Origin': '*' }
  }
})
```


### bodyParser: *`{Function}`*	
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
const { Middleware, common } = require('aws-lambda-middleware')
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
const { Middleware } = require('aws-lambda-middleware')

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


### pathPropNameType: *`{String}`*	
> Set the notation type of propName displayed in the error log.   

| Type | Default | Description |
| --- | --- |  --- |
| single |  | Only propName of 1 depth is displayed |
| simple | Y | Only propNames of up to 3 depth are displayed |
| full |  | PropName of entire depth |

```js
const { Middleware } = require('aws-lambda-middleware')

Middleware.globalOption({
  pathPropNameType: 'simple'
})
```

ex) When `pathPropNameType: 'simple'` is set and the data type of request param `body.photos.1` is invalid, the message below is returned.     
> `'body.photos.1'` is a parameter in an invalid type   


### ignoreFirstPathPropNames: *`{Array}`*	
> Set the notation type to be ignored among the propNames of the first depth displayed in the error log.   
> If there is only one depth, this setting is ignored.   

```js
const { Middleware } = require('aws-lambda-middleware')

Middleware.globalOption({
  ignoreFirstPathPropNames: ['body', 'queryStringParameters', 'pathParameters']
})
```

ex) When `ignoreFirstPathPropNames: ['body']` is set and the data type of request param `body.photos.1` is invalid, the following message is returned   
> `'photos.1'` is a parameter in an invalid type   


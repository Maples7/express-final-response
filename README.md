# express-final-response
[![Build Status](https://travis-ci.org/Maples7/express-final-response.svg?branch=master)](https://travis-ci.org/Maples7/express-final-response)
[![Coverage Status](https://coveralls.io/repos/github/Maples7/express-final-response/badge.svg?branch=master)](https://coveralls.io/github/Maples7/express-final-response?branch=master)
[![npm version](https://badge.fury.io/js/express-final-response.svg)](https://badge.fury.io/js/express-final-response)           
[![NPM](https://nodei.co/npm/express-final-response.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/express-final-response/)
[![NPM](https://nodei.co/npm-dl/express-final-response.png?months=6&height=3)](https://nodei.co/npm/express-final-response/)       
The very last middleware of Express to handle every response of every request.

## Features
- Both json-type response and HTML-type response (with some Express template engine) are supported at the same time
- Log every request while neccessary, and the logger is decided by you
- Every response has consistent and standard format, and also you are highly encouraged to customize yours for every distinct response
- Well tested

## Usage
### Installation
`yarn add express-final-response` or `npm install express-final-response --save`;

### Work with Express
Let me just give you a clear example:
```js
const path = require('path');
const express = require('express');
const routes = require('express-mount-routes');
const finalResp = require('express-final-response');

const app = express();

// set Express template engine if you need to
app.set('view engine', 'pug');

// mount routes, see https://github.com/Maples7/express-mount-routes
routes(app, path.join(__dirname, 'controllers'));

// a very easy-to-write 404 middleware thank to this awesome package
app.use((isAPI = true) => {
  if (isAPI) {
    return (req, res, next) => next({status: 'APINotFound'});
  } else {
    // of course you can give a view to it and then it will return an HTML page to you
    return (req, res, next) => next({status: 'PageNotFound', view: '404'});
  }
});

// aha, finally we got the protagonist
app.use(finalResp({isDebug: process.env.NODE_ENV !== 'production'}));

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
```

### API
```js
// right value of `=` is default value and all parameters are optional
app.use(finalResp({
  // you are highly encouraged to customize yours for every distinct response, see ./lib/status.json to get the essentials: 
    // statusCode -> HTTP Response Code
    // successful -> Whether a successful response or not
    // code -> Custom response code. It can be used by mobile client or front-ends to customize their own response to user. Also you'd better well classify them according to the type of response such as user module of your system or article module and make every one unique.
    // status -> this string is used to locate status in this package (it's better than using `code` because it's semantic), so make sure they are unique upon most occasions. That's to say, the former status would be replaced by the latter one who keeps the same `status` string param.
    // desc -> brief description
  customStatuses = [],

  // response encoding
  encoding = 'utf-8',

  // logger
  logger = console,

  // if response is a JSON, you can return a true JSON or a String (with `JSON.stringify(JSONResult)`)
    // JSON -> Return a true JSON
    // String -> Return a String with `JSON.stringify(JSONResult)`. This is prepared for some wired clients.
  JSONformat = 'JSON',

  // If this switch is true, all error infomation (error stack included) would be return to client while error occurs; If not, user would noly get error.message. This is prevent key infomation leak from hackers. And don't worry, all infomation will be logged.
  isDebug = false,

  // Whether only log error response or not
  onlyLogError = false,

  // if there is a global error view such as 500.pug, error response would be an HTML page with the defined error view. Also, you can customize it in each response with param `view`. 
  errorView = undefined
}));
```

### Response in each request
Once you want to return result in each request, call [Express `next()` function](http://expressjs.com/en/guide/error-handling.html) (Actually, we are making use of error handling mechanism of Express) with proper params.

#### If response is an error, thare are several ways to do this:
```js
// pass an Error and `error` status would be applied automatically.
next(new Error('I am an Error')); 

// pass an object but `msg` is an error, then `DBError` status would be applied and returned `msg` would be 'TrueError'. This way is better than former one because it can pass more infomation.
next({status: 'DBError', msg: new Error('TrueError')});

// the view would be applied so an HTML page would be returned. If there is no view param, a JSON would be returned like above, and the infomation in the returned JSON could be used while rendering view template.
next({status: 'error', msg: new Error('I am an error'), view: '500'});
``` 
Response object would contain `statusCode`, `successful`, `code`, `status`, `desc`, `msg`, `ext`(when `isDebug` switch is on), for example:
```js
{ 
  statusCode: 500,
  successful: false,
  code: 2,
  status: 'error',
  desc: 'Request Error!',
  msg: 'I am an error',
  ext: '...'  // the whole Error object
}
```

#### If response is normal data, do it like this:
```js
// the most ordinary way, `ext` is optional. `msg` here is designed for holding real data you want to return to clients or front-ends.
next({status: 'success', msg: 'test 1 success'});

// the view would be applied so an HTML page would be returned. If there is no view param, a JSON would be returned like above, and the infomation in the returned JSON could be used while rendering view template.
next({status: 'success', msg: 'test 1 success', view: '200'});
```
Response object would contain `statusCode`, `successful`, `code`, `status`, `desc`, `msg`(optional), `ext`(optional), for example:
```js
{
  statusCode: 200,
  successful: true,
  code: 0,
  status: 'success',
  desc: 'Request Successful!',
  msg: 'test 1 success' 
}
```

#### See default statuses definition
There are so many other defaut statuses you can choose besides `success` and `error`, make sure to see [./lib/status.json](lib/status.json) to catch them. Of course, you can define your own statuses for the benefit of `customStatus` parameter like what I have told you.
 

You are welcomed to review _test.js_, _controllers_ dir and _views_ dir in this project for more information of usage.

## LICENSE
[MIT](LICENSE)

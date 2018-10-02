
* [steps](#module_steps)
    * [~anonymous()](#module_steps..anonymous)
    * [~makeRequest()](#module_steps..makeRequest)
    * [~addQueryString()](#module_steps..addQueryString)
    * [~addRequestBody()](#module_steps..addRequestBody)
    * [~addRequestBodyFromExample()](#module_steps..addRequestBodyFromExample)
    * [~setCookie()](#module_steps..setCookie)
    * [~receiveRequestWithStatus()](#module_steps..receiveRequestWithStatus)
    * [~receiveWithinTime()](#module_steps..receiveWithinTime)
    * [~responseBodyJsonPath()](#module_steps..responseBodyJsonPath)

### Given I am anonymous
Explicitly state that the client is not authenticated

**Example**  
```js
Given I am anonymous
```
### When I send a {method} request to {resource}
Construct a request to an resource using an HTTP method
Note: this should be the first "When"

**Example**  
```js
When I send a 'GET' request to '/pets'
```
### When I add the query string parameters
Add query string paramaters defined in a Gherkin data table

**Example**  
```js
When I add the query string parameters
 | sort   | desc |
 | filter | red  |
```
### When I add the request body
Add a JSON request body included in the Gherkin doc strings

**Example**  
```js
When I add the request body
 """
 { "name" : "Ka", "type" : "Snake" }
 """
```
### When I add the example request body
Adds a request body extracted from the open api spec

**Example**  
```js
When I add the example request body
```
### When I set the cookie:
Set a cookie on the request

**Example**  
```js
When I set the cookie:
  | Name   | foo |
  | Value  | bar |
  | Flags  | Expires=21 Oct 2015 07:28:00 GMT; Secure; HttpOnly; Path=\/ |
```
### Then I should receive a response with the status {statusCode}
Ensure the response was received with a given status
This, generally, should be the first "Then"

**Example**  
```js
Then I should receive a response with the status 200
```
### Then I should receive a response within {miliseconds}ms
Ensure the response was received within a time limit
If using this step, it should be the first "Then"

**Example**  
```js
Then I should receive a response within 500ms
```
### Then the response body json path at {jsonPath} should equal {expectedValue}
Ensure a JSON response body contains a given value at the JSON path
See [http://goessner.net/articles/JsonPath/](http://goessner.net/articles/JsonPath/)

**Example**  
```js
Then the response body json path at "$.[1].name" should equal "Rover"
```

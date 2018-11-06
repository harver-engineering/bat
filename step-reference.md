
* [steps](#module_steps)
    * [~anonymous()](#module_steps..anonymous)
    * [~defaultContentType()](#module_steps..defaultContentType)
    * [~makeRequest()](#module_steps..makeRequest)
    * [~addQueryString()](#module_steps..addQueryString)
    * [~addRequestBodyFromFile()](#module_steps..addRequestBodyFromFile)
    * [~addRequestBody()](#module_steps..addRequestBody)
    * [~addRequestBodyWithContentType()](#module_steps..addRequestBodyWithContentType)
    * [~addRequestBodyFromExample()](#module_steps..addRequestBodyFromExample)
    * [~setRequestHeaders()](#module_steps..setRequestHeaders)
    * ~~[~setRequestCookie()](#module_steps..setRequestCookie)~~
    * [~setRequestCookies()](#module_steps..setRequestCookies)
    * [~populateRequestPathPlaceholder()](#module_steps..populateRequestPathPlaceholder)
    * [~receiveRequestWithStatus()](#module_steps..receiveRequestWithStatus)
    * [~receiveWithinTime()](#module_steps..receiveWithinTime)
    * [~responseBodyJsonPath()](#module_steps..responseBodyJsonPath)
    * [~setResponseCookie()](#module_steps..setResponseCookie)
    * [~validateAgainstSchema()](#module_steps..validateAgainstSchema)
    * [~validateAgainstInlineSchema()](#module_steps..validateAgainstInlineSchema)

### Given I am anonymous
Explicitly state that the client is not authenticated

**Example**  
```js
Given I am anonymous
```
### I am using the default content type: {string}
Set a default Content-Type header for future requests. This is useful
as a step in a feature's "Background"

**Example**  
```js
Given I am using the default content type: "application/json"
```
### When I send a {method} request to {resource}
Construct a request to a resource using an HTTP method
Note: this should be the first "When"

**Example**  
```js
When I send a 'GET' request to '/pets'
```
### When I add the query string parameters:
Add query string paramaters defined in a Gherkin data table

**Example**  
```js
When I add the query string parameters:
 | sort   | desc |
 | filter | red  |
```
### I add the request from json file: {filePath}
Add a JSON request body included in the Gherkin doc strings to the json file

**Example**  
```js
I add the request from json file: '/test/files/json/sample-json'
```
### When I add the request body
Add a JSON request body included in the Gherkin doc strings
### When I add the request body:
Add a request body included in the Gherkin doc strings or data table.
The content will be 'json' or that (if any) set by
"Given I am using the default content type:"

**Example**  
```js
When I add the request body
"""
{ "name" : "Ka", "type" : "Snake" }
"""
```
### When I add the request body:
Add a request body included in the Gherkin doc strings or data table
with a given content type

The type "application/x-www-form-urlencoded" can be abbreviated to just "form"

**Example**  
```js
When I add the "form" request body
 | name | Ka    |
 | type | Snake |
```
### When I add the example request body
Adds a request body extracted from the open api spec for this request's resource and method
See the [test openapi.yaml](../test/openapi.yaml) for an example.

**Example**  
```js
When I add the example request body
```
### When I set the request headers:
Set one or more request headers in a single step

**Example**  
```js
When I set the request headers:
  | Content-Type     | application/json |
  | Accept-Language  | en               |
```
***Deprecated***

### When I set the cookie:
Set a cookie on the request using a data table

**Example**  
```js
When I set the cookie:
  | Name   | foo |
  | Value  | bar |
  | Flags  | Expires=21 Oct 2015 07:28:00 GMT; Secure; HttpOnly; Path=\/ |
```
### When I set the cookies:
Sets one or more cookies on the request using a data table

**Example**  
```js
When I set the cookies:
 | Name | Value | Flags  |
 | foo  | bar   | path=/ |
```
### When I set the placeholder {string} using the json path {jsonPath} from the last {method} to {resource}

Say, in a previous scenario, a 'GET' request was sent '/pets'. We can extract data from
this response and use it to populate placeholders in subsequent requests.

The example below will extract an id from a previously retrieved set of pets. And use it
to populate the placeholder to get a specific pet resource

**Example**  
```js
When I send a 'GET' request to '/pets/{id}'
And I set the placeholder 'id' using the json path '$.[0].id' from the last 'GET' to '/pets'
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
### Then I should receive a response that sets the cookie:

Asserts that a response sent a cookie to the client

**Example**  
```js
I should receive a response that sets the cookie
  | Name  | foo |
  | Value | bar |
```
### Then the response body should validate against its response schema

This will extract the response body json schemea from the Open API spec and
validate the current response body against it

**Example**  
```js
Then the response body should validate against its response schema
```
### Then the response body should validate against its response schema

This allows to provide an inline response schema to validate the current
response body against. Generally not recommend because this can make the
feature file very verbose.

**Example**  
```js
Then the response body should validate against the response schema:
"""
{ ... }
"""
```

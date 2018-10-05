
* [steps](#module_steps)
    * [~anonymous()](#module_steps..anonymous)
    * [~makeRequest()](#module_steps..makeRequest)
    * [~addQueryString()](#module_steps..addQueryString)
    * [~addRequestBody()](#module_steps..addRequestBody)
    * [~addRequestBodyFromExample()](#module_steps..addRequestBodyFromExample)
    * [~setRequestHeaer()](#module_steps..setRequestHeaer)
    * [~setRequestCookie()](#module_steps..setRequestCookie)
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
### When I send a {method} request to {resource}
Construct a request to a resource using an HTTP method
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
Adds a request body extracted from the open api spec for this request's resource and method
See the [test openapi.yaml](../test/openapi.yaml) for an example.

**Example**  
```js
When I add the example request body
```
### When I set the request header:
Set a header on the request using a data table

**Example**  
```js
When I set the request header:
  | Name   | Accept-Language |
  | Value  | en              |
```
### When I set the cookie:
Set a cookie on the request using a data table

**Example**  
```js
When I set the cookie:
  | Name   | foo |
  | Value  | bar |
  | Flags  | Expires=21 Oct 2015 07:28:00 GMT; Secure; HttpOnly; Path=\/ |
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

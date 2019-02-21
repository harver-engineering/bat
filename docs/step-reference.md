
* [steps](#module_steps)
    * [~anonymous()](#module_steps..anonymous)
    * [~obtainAccessToken()](#module_steps..obtainAccessToken)
    * [~obtainAccessTokenUsingFileCredentials()](#module_steps..obtainAccessTokenUsingFileCredentials)
    * [~defaultContentType()](#module_steps..defaultContentType)
    * [~setVariables()](#module_steps..setVariables)
    * [~makeRequest()](#module_steps..makeRequest)
    * [~addQueryString()](#module_steps..addQueryString)
    * [~addRequestBody()](#module_steps..addRequestBody)
    * [~addRequestBodyWithContentType()](#module_steps..addRequestBodyWithContentType)
    * [~addRequestBodyFromExample()](#module_steps..addRequestBodyFromExample)
    * [~addRequestBodyFromFile()](#module_steps..addRequestBodyFromFile)
    * [~setRequestHeaders()](#module_steps..setRequestHeaders)
    * [~setRequestCookies()](#module_steps..setRequestCookies)
    * [~populatePlaceholder()](#module_steps..populatePlaceholder)
    * [~receiveRequestWithStatus()](#module_steps..receiveRequestWithStatus)
    * [~receiveWithinTime()](#module_steps..receiveWithinTime)
    * [~receiveText()](#module_steps..receiveText)
    * [~responseHeaderEquals()](#module_steps..responseHeaderEquals)
    * [~responseBodyJsonPathEquals()](#module_steps..responseBodyJsonPathEquals)
    * [~responseCookieEquals()](#module_steps..responseCookieEquals)
    * [~validateAgainstSpecSchema()](#module_steps..validateAgainstSpecSchema)
    * [~validateAgainstInlineSchema()](#module_steps..validateAgainstInlineSchema)
    * [~validateAgainstFileSchema()](#module_steps..validateAgainstFileSchema)
    * [~printRequest()](#module_steps..printRequest)
    * [~printResponseBody()](#module_steps..printResponseBody)

### Given I am anonymous
Explicitly state that the client is not authenticated

**Example**  
```js
Given I am anonymous
```
### Given I obtain an access token from {string} using the credentials:
Supports logging into using OAuth2 credentials, typically with the passwrod scheme
Sessions (access tokens) will be stored and supported for subsequent requests

**Example**  
```js
Given I obtain an access token from "{base}/auth/token" using the credentials:
 | client_id     | harver    |
 | client_secret | harver123 |
 | username      | gerald    |
 | password      | foobar    |
 | grant_type    | password  |
```
**Example** *(Short form)*  
```js
Given get token from "{base}/auth/token" using:
```
### Given I obtain an access token from {string} using the credentials:
Supports logging into using OAuth2 credentials, typically with the password scheme
Sessions (access tokens) will be stored and supported for subsequent requests

**Example**  
```js
Given I obtain an access token from "{base}/auth/token" using the credentials: "/path/to/user.json"
```
**Example** *(Short form)*  
```js
Given get token from "{base}/auth/token" using credentials from: "/path/to/user.json"
```
### I am using the default content type: {string}
Set a default Content-Type header for future requests. This is useful
as a step in a feature's "Background"

**Example**  
```js
Given I am using the default content type: "application/json"
```
**Example** *(Short form)*  
```js
Given default content type: "application/json"
```
### Given I set the variables:
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
When I send a 'GET' request to "/pets"
```
**Example** *(Short form)*  
```js
When GET "/pets"
```
### When I add the query string parameters:
Add query string paramaters defined in a Gherkin data table

**Example**  
```js
When I add the query string parameters:
 | sort   | desc |
 | filter | red  |
```
**Example** *(Short form)*  
```js
When qs:
 | sort   | desc |
 | filter | red  |
```
### When I add the request body
Add a JSON request body included in the Gherkin doc strings

**Example**  
```js
When I add the request body:
"""
{ "name" : "Ka", "type" : "Snake" }
"""
```
**Example** *(Short form)*  
```js
When send:
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
**Example** *(Short form)*  
```js
When send "forn":
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
**Example** *(Short form)*  
```js
When send example body
```
### When I add the request body from the file: {filePath}
Add a request body loaded from a file.

**Example**  
```js
When I add the request body from the file: "/test/files/json/sample-json"
```
**Example** *(Short form)*  
```js
When send from file "/test/files/json/sample-json"
```
### When I set the request headers:
Set one or more request headers in a single step

**Example**  
```js
When I set the request headers:
  | Content-Type     | application/json |
  | Accept-Language  | en               |
```
**Example** *(Short form)*  
```js
When set:
  | Content-Type     | application/json |
  | Accept-Language  | en               |
```
### When I set the cookies:
Sets one or more cookies on the request using a data table

**Example**  
```js
When I set the cookies:
 | Name | Value | Flags  |
 | foo  | bar   | path=/ |
```
**Example** *(Short form)*  
```js
When set cookies:
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
**Example** *(Short form)*  
```js
Then receive status 200
```
### Then I should receive a response within {miliseconds}ms
Ensure the response was received within a time limit

**Example**  
```js
Then I should receive a response within 500ms
```
**Example** *(Short form)*  
```js
Then within 500ms
```
### Then I should receive the text

**Example**  
```js
Then I should receive the text:
"""
The quick brown fox
"""
```
**Example** *(Short form)*  
```js
Then receive text:
"""
The quick brown fox
"""
```
### Then the response header {string} should equal {string}
Ensure a response header equals the expect value

**Example**  
```js
Then the response header "Content-Type" should equal "application/json"
```
### Then the response body json path at {jsonPath} should equal {expectedValue}
Ensure a JSON response body contains a given value at the JSON path
See [http://goessner.net/articles/JsonPath/](http://goessner.net/articles/JsonPath/)

**Example**  
```js
Then the response body json path at "$.[1].name" should equal "Rover"
```
**Example** *(Short form)*  
```js
Then json path at "$.[1].name" should equal "Rover"
```
### Then I should receive a response that sets the cookie:

Asserts that a response sent a cookie to the client

**Example**  
```js
Then I should receive a response that sets the cookie
  | Name  | Value |
  | foo   | bar   |
```
**Example** *(Short form)*  
```js
Then response sets cookie
  | Name  | Value |
  | foo   | bar   |
```
### Then the response body should validate against its response schema

This will extract the response body json schemea from the Open API spec and
validate the current response body against it

**Example**  
```js
Then the response body should validate against its response schema
```
**Example** *(Short form)*  
```js
Then validate against schema
```
### Then the response body should validate against its response schema

This allows you to provide an inline response schema to validate the current
response body against. Generally not recommend because this can make the
feature file very verbose.

**Example**  
```js
Then the response body should validate against the response schema:
"""
{ ... }
"""
```
**Example** *(Short form)*  
```js
Then validate against the schema:
"""
{ ... }
"""
```
### Then the response body should validate against the schema from {string}

This will load a response body json schemea from a file

**Example**  
```js
Then the response body should validate against the schema from "./path/to/schema.json"
```
**Example** *(Short form)*  
```js
Then validate against the schema from "./path/to/schema.json"
```
### Then print the request

Debug step which prints the request that SuperAgent will send

**Example**  
```js
Then print the request
```
### Then print the response body

Debug step that will print the received response body.

This must run after the `Then I should receive a response with the status <status>` step
but will not run if that step fails to assert. So you might need to temporarily change
this expectation in order to debug the response body received.

**Example**  
```js
Then print the response body
```

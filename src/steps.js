const fn = require('./steps-fn');

/** @module steps */

function registerSteps({ Given, When, Then }) {

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // Given
    // Background steps to sending a request
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * ### Given I am anonymous
     * Explicitly state that the client is not authenticated
     *
     * @example
     * Given I am anonymous
     *
     * @function anonymous
     */
    Given('I am anonymous', function anonymous() {
        // nothing to do
    });

    /**
     * ### Given I obtain an access token from {string} using the credentials:
     * Supports logging into using OAuth2 credentials, typically with the passwrod scheme
     * Sessions (access tokens) will be stored and supported for subsequent requests
     *
     * @example
     * Given I obtain an access token from "{base}/auth/token" using the credentials:
     *  | client_id     | harver    |
     *  | client_secret | harver123 |
     *  | username      | gerald    |
     *  | password      | foobar    |
     *  | grant_type    | password  |
     *
     * @example <caption>Short form</caption>
     * Given get token from "{base}/auth/token" using:
     *
     * @function obtainAccessToken
     */
    Given('I obtain an access token from {string} using the credentials:', fn.obtainAccessToken);

    // short form
    Given('get token from {string} using:', fn.obtainAccessToken);

    /**
     * ### Given I obtain an access token from {string} using the credentials:
     * Supports logging into using OAuth2 credentials, typically with the password scheme
     * Sessions (access tokens) will be stored and supported for subsequent requests
     *
     * @example
     * Given I obtain an access token from "{base}/auth/token" using the credentials: "/path/to/user.json"
     *
     * @example <caption>Short form</caption>
     * Given get token from "{base}/auth/token" using credentials from: "/path/to/user.json"
     *
     * @function obtainAccessTokenUsingFileCredentials
     */
    Given('I obtain an access token from {string} using credentials from: {string}',
        fn.obtainAccessTokenUsingFileCredentials);

    // short form
    Given('get token from {string} using credentials from: {string}',
        fn.obtainAccessTokenUsingFileCredentials);

    /**
     * ### I am using the default content type: {string}
     * Set a default Content-Type header for future requests. This is useful
     * as a step in a feature's "Background"
     *
     * @example
     * Given I am using the default content type: "application/json"
     *
     * @example <caption>Short form</caption>
     * Given default content type: "application/json"
     *
     * @function defaultContentType
     */
    Given('I am using the default content type: {string}', fn.defaultContentType);

    // short form
    Given('default content type: {string}', fn.defaultContentType);

    /**
     * ### Given I set the variables:
     * Explicitly state that the client is not authenticated
     *
     * @example
     * Given I am anonymous
     *
     * @function setVariables
     */
    Given(/^I set the variables?:$/, fn.setVariables);

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // When
    // Setup the request
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * ### When I send a {method} request to {resource}
     * Construct a request to a resource using an HTTP method
     * Note: this should be the first "When"
     *
     * @example
     * When I send a 'GET' request to "/pets"
     *
     * @example <caption>Short form</caption>
     * When GET "/pets"
     *
     * @function makeRequest
     */
    When('I send a {string} request to {string}', fn.makeRequest);

    // short form
    When(/^(POST|GET|PUT|PATCH|DELETE|HEAD) "([^"]+)"$/i, fn.makeRequest);

    /**
     * ### When I add the query string parameters:
     * Add query string paramaters defined in a Gherkin data table
     *
     * @example
     * When I add the query string parameters:
     *  | sort   | desc |
     *  | filter | red  |
     *
     * @example <caption>Short form</caption>
     * When qs:
     *  | sort   | desc |
     *  | filter | red  |
     *
     * @function addQueryString
     */
    When('I add the query string parameters:', fn.addQueryString);

    // short form
    When('qs:', fn.addQueryString);

    /**
     * ### When I add the request body
     * Add a JSON request body included in the Gherkin doc strings
     *
     * @example
     * When I add the request body:
     * """
     * { "name" : "Ka", "type" : "Snake" }
     * """
     *
     * @example <caption>Short form</caption>
     * When send:
     * """
     * { "name" : "Ka", "type" : "Snake" }
     * """
     *
     * @function addRequestBody
     */
    When('I add the request body:', fn.addRequestBody);

    // short form
    When('send:', fn.addRequestBody);

    /**
     * ### When I add the request body:
     * Add a request body included in the Gherkin doc strings or data table
     * with a given content type
     *
     * The type "application/x-www-form-urlencoded" can be abbreviated to just "form"
     *
     * @example
     * When I add the "form" request body
     *  | name | Ka    |
     *  | type | Snake |
     *
     * @example <caption>Short form</caption>
     * When send "forn":
     *  | name | Ka    |
     *  | type | Snake |
     *
     * @function addRequestBodyWithContentType
     */
    When('I add the {string} request body:', fn.addRequestBodyWithContentType);

    // short form
    When('send {string}:', fn.addRequestBodyWithContentType);

    /**
     * ### When I add the example request body
     * Adds a request body extracted from the open api spec for this request's resource and method
     * See the [test openapi.yaml](../test/openapi.yaml) for an example.
     *
     * @example
     * When I add the example request body
     *
     * @example <caption>Short form</caption>
     * When send example body
     *
     * @function addRequestBodyFromExample
     */
    When('I add the example request body', fn.addRequestBodyFromExample);

    // short form
    When('send example body', fn.addRequestBodyFromExample);

    /**
     * ### When I add the request body from the file: {filePath}
     * Add a request body loaded from a file.
     *
     * @example
     * When I add the request body from the file: "/test/files/json/sample-json"
     *
     * @example <caption>Short form</caption>
     * When send from file "/test/files/json/sample-json"
     *
     * @function addRequestBodyFromFile
     */
    When('I add the request body from the file: {string}', fn.addRequestBodyFromFile);

    // short form
    When('send from file: {string}', fn.addRequestBodyFromFile);

    /**
     * ### When I set the request headers:
     * Set one or more request headers in a single step
     *
     * @example
     * When I set the request headers:
     *   | Content-Type     | application/json |
     *   | Accept-Language  | en               |
     *
     * @example <caption>Short form</caption>
     * When set:
     *   | Content-Type     | application/json |
     *   | Accept-Language  | en               |
     *
     * @function setRequestHeaders
     */
    When(/^I set the request headers?:$/, fn.setRequestHeaders);

    // short form
    When('set:', fn.setRequestHeaders);

    /**
     * ### When I set the cookies:
     * Sets one or more cookies on the request using a data table
     *
     * @example
     * When I set the cookies:
     *  | Name | Value | Flags  |
     *  | foo  | bar   | path=/ |
     *
     * @example <caption>Short form</caption>
     * When set cookies:
     *  | Name | Value | Flags  |
     *  | foo  | bar   | path=/ |
     *
     * @function setRequestCookies
     */
    When(/I set the cookies?:/, fn.setRequestCookies);

    // short form
    When(/^set cookies?:$/, fn.setRequestCookies);

    /**
     * ### When I set the placeholder {string} using the json path {jsonPath} from the last {method} to {resource}
     *
     * Say, in a previous scenario, a 'GET' request was sent '/pets'. We can extract data from
     * this response and use it to populate placeholders in subsequent requests.
     *
     * The example below will extract an id from a previously retrieved set of pets. And use it
     * to populate the placeholder to get a specific pet resource
     *
     * @example
     * When I send a 'GET' request to '/pets/{id}'
     * And I set the placeholder 'id' using the json path '$.[0].id' from the last 'GET' to '/pets'
     *
     * @function populatePlaceholder
     */
    When('I set the placeholder {string} using the json path {string} from the last {string} to {string}',
        fn.populatePlaceholder);

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // Then
    // Send the request and run assertions on the response
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * ### Then I should receive a response with the status {statusCode}
     * Ensure the response was received with a given status
     * This, generally, should be the first "Then"
     *
     * @example
     * Then I should receive a response with the status 200
     *
     * @example <caption>Short form</caption>
     * Then receive status 200
     *
     * @function receiveRequestWithStatus
     */
    Then('I should receive a response with the status {int}', fn.receiveRequestWithStatus);

    // short form
    Then('receive status {int}', fn.receiveRequestWithStatus);

    /**
     * ### Then I should receive a response within {miliseconds}ms
     * Ensure the response was received within a time limit
     *
     * @example
     * Then I should receive a response within 500ms
     *
     * @example <caption>Short form</caption>
     * Then within 500ms
     *
     * @function receiveWithinTime
     */
    Then('I should receive a response within {int}ms', fn.receiveWithinTime);

    // short form
    Then('within {int}ms', fn.receiveWithinTime);

    /**
     * ### Then I should receive the text
     *
     * @example
     * Then I should receive the text:
     * """
     * The quick brown fox
     * """
     *
     * @example <caption>Short form</caption>
     * Then receive text:
     * """
     * The quick brown fox
     * """
     *
     * @function receiveText
     */
    Then('I should receive the text:', fn.receiveText);

    // short form
    Then('receive text:', fn.receiveText);

    /**
     * ### Then the response header {string} should equal {string}
     * Ensure a response header equals the expect value
     *
     * @example
     * Then the response header "Content-Type" should equal "application/json"
     *
     * @function responseHeaderEquals
     */
    Then('the response header {string} should equal {string}', fn.responseHeaderEquals);

    /**
     * ### Then the response body json path at {jsonPath} should equal {expectedValue}
     * Ensure a JSON response body contains a given value at the JSON path
     * See [http://goessner.net/articles/JsonPath/](http://goessner.net/articles/JsonPath/)
     *
     * @example
     * Then the response body json path at "$.[1].name" should equal "Rover"
     *
     * @example <caption>Short form</caption>
     * Then json path at "$.[1].name" should equal "Rover"
     *
     * @function responseBodyJsonPathEquals
     */
    Then('the response body json path at {string} should equal {string}', fn.responseBodyJsonPathEquals);

    // short form
    Then('json path at {string} should equal {string}', fn.responseBodyJsonPathEquals);

    /**
     * ### Then I should receive a response that sets the cookie:
     *
     * Asserts that a response sent a cookie to the client
     *
     * @example
     * Then I should receive a response that sets the cookie
     *   | Name  | Value |
     *   | foo   | bar   |
     *
     * @example <caption>Short form</caption>
     * Then response sets cookie
     *   | Name  | Value |
     *   | foo   | bar   |
     *
     * @function responseCookieEquals
     */
    Then('I should receive a response that sets the cookie:', fn.responseCookieEquals);

    // short form
    Then('response sets cookie:', fn.responseCookieEquals);

    /**
     * ### Then the response body should validate against its response schema
     *
     * This will extract the response body json schemea from the Open API spec and
     * validate the current response body against it
     *
     * @example
     * Then the response body should validate against its response schema
     *
     * @example <caption>Short form</caption>
     * Then validate against schema
     *
     * @function validateAgainstSpecSchema
     */
    Then('the response body should validate against its schema', fn.validateAgainstSpecSchema);

    // short form
    Then('validate against schema', fn.validateAgainstSpecSchema);

    /**
     * ### Then the response body should validate against its response schema
     *
     * This allows you to provide an inline response schema to validate the current
     * response body against. Generally not recommend because this can make the
     * feature file very verbose.
     *
     * @example
     * Then the response body should validate against the response schema:
     * """
     * { ... }
     * """
     *
     * @example <caption>Short form</caption>
     * Then validate against the schema:
     * """
     * { ... }
     * """
     *
     * @function validateAgainstInlineSchema
     */
    Then('the response body should validate against the schema:', fn.validateAgainstInlineSchema);

    // short form
    Then('validate against the schema:', fn.validateAgainstInlineSchema);

    /**
     * ### Then the response body should validate against the schema from {string}
     *
     * This will load a response body json schemea from a file
     *
     * @example
     * Then the response body should validate against the schema from "./path/to/schema.json"
     *
     * @example <caption>Short form</caption>
     * Then validate against the schema from "./path/to/schema.json"
     *
     * @function validateAgainstFileSchema
     */
    Then('the response body should validate against the schema from {string}', fn.validateAgainstFileSchema);

    Then('validate against the schema from {string}', fn.validateAgainstFileSchema);

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // Some debug helpers
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * ### Then print the request
     *
     * Debug step which prints the request that SuperAgent will send
     *
     * @example
     * Then print the request
     *
     * @function printRequest
     */
    Then('print the request', async function () {
        this.debug.push(`[debug] Showing request details for "${this.req.method}" to "${this.req.url}":\n`);
        this.debug.push(JSON.stringify(this.req, null, '  '));
    });

    /**
     * ### Then print the response body
     *
     * Debug step that will print the received response body.
     *
     * This must run after the `Then I should receive a response with the status <status>` step
     * but will not run if that step fails to assert. So you might need to temporarily change
     * this expectation in order to debug the response body received.
     *
     * @example
     * Then print the response body
     *
     * @function printResponseBody
     */
    Then('print the response body', async function () {
        let res;
        try {
            res = await this.req;
        } catch (err) {
            if (!err.status) {
                throw err;
            }
            res = err.response;
        }

        this.debug.push(`[debug] Showing response body for "${this.req.method}" to "${this.req.url}":\n`);
        this.debug.push(JSON.stringify(res.body, null, '  '));
    });
}

module.exports = {
    registerSteps,
}
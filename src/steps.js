const chai = require('chai');
const Ajv = require('ajv');
const cookie = require('cookie');
const JSONPath = require('jsonpath-plus');
const { expect } = chai;
const ajv = new Ajv();

const methodsWithBodies = [ 'POST', 'PUT', 'PATCH', 'DELETE'];
const placeHolderRegex = /[^{]+(?=})/g;

/** @module steps */

function registerSteps({ Given, When, Then }) {

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // Given
    // Background steps to sending a request
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * ### Given I am anonymous
     * Explicitly state that the client is not authenticated
     * @example
     * Given I am anonymous
     *
     * @function anonymous
     */
    Given('I am anonymous', function() {
        // nothing to do here
    });

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // When
    // Setup the request
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * ### When I send a {method} request to {resource}
     * Construct a request to an resource using an HTTP method
     * Note: this should be the first "When"
     *
     * @example
     * When I send a 'GET' request to '/pets'
     *
     * @function makeRequest
     */
    When('I send a {string} request to {string}', async function(method, path) {
        this.req = this.currentAgent[method.toLowerCase()](this.baseUrl + path);

        if(methodsWithBodies.includes(method)) {
            this.req.set('Content-Type', 'application/json');
        }
    });

    /**
     * ### When I add the query string parameters
     * Add query string paramaters defined in a Gherkin data table
     *
     * @example
     * When I add the query string parameters
     *  | sort   | desc |
     *  | filter | red  |
     *
     * @function addQueryString
     */
    When('I add the query string parameters', function(qs) {
        const queryObject = qs.rowsHash();
        // handle multi-value queryParameters
        for (const prop in queryObject) {
            if (queryObject[prop].includes(',')) {
                queryObject[prop] = queryObject[prop].split(',');
            }
        }
        this.req.query(queryObject);
    });

    /**
     * ### When I add the request body
     * Add a JSON request body included in the Gherkin doc strings
     *
     * @example
     * When I add the request body
     *  """
     *  { "name" : "Ka", "type" : "Snake" }
     *  """
     *
     * @function addRequestBody
     */
    When('I add the request body:', async function (body) {
        // this doesn't actually send the request yet
        this.req.send(body);
    });

    /**
     * ### When I add the example request body
     * Adds a request body extracted from the open api spec
     *
     * @example
     * When I add the example request body
     *
     * @function addRequestBodyFromExample
     */
    When('I add the example request body', async function () {
        const spec = await this.getEndpointSpec();
        const body = spec.requestBody.content['application/json'].example;

        // this doesn't actually send the request yet
        this.req.send(body);
    });

    /**
     * ### When I set the cookie:
     * Set a cookie on the request
     *
     * @example
     * When I set the cookie:
     *   | Name   | foo |
     *   | Value  | bar |
     *   | Flags  | Expires=21 Oct 2015 07:28:00 GMT; Secure; HttpOnly; Path=\/ |
     *
     * @function setCookie
     */
    When('I set the cookie:', function(cookieData) {
        const { Name: name, Value: value, Flags: flags } = cookieData.rowsHash();
        this.req.set('Cookie', `${name}=${value};${flags}`);
    });

    /**
     * ### When I set the placeholder {string} with the response json path {jsonPath} from the last {method} to {resource}
     *
     * Test and document me
     */
    When('I set the placeholder {string} with the response json path {string} from the last {string} to {string}', function(placeHolder, jsonPath, method, path){
        const parsedResponse = this.retrieveResponse(path, method);

        // Iterate over the string 'url' and replace any {placeHolders} if present with dynamic data from context
        const extractKeys = currentPath.match(placeHolderRegex) || [];

        for (const key of extractKeys) {
            const placeHolderValue = JSONPath.eval(parsedResponse, jsonPath)[0];
            currentPath = key === placeHolder ? currentPath.replace(`{${key}}`, placeHolderValue) : currentPath;
        }

        this.req = this.currentAgent[method](this.baseUrl + currentPath);
    });

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
     * @function receiveRequestWithStatus
     */
    Then('I should receive a response with the status {int}', async function(status) {
        // this sends the request
        // (await will implictly call `then()` on the SuperAgent request object)
        try {
            const res = await this.req;
            this.saveCurrentResponse();
            expect(res.status).to.equal(status);
        } catch(err) {
            throw new Error(err);
        }
    });

    /**
     * ### Then I should receive a response within {miliseconds}ms
     * Ensure the response was received within a time limit
     * If using this step, it should be the first "Then"
     *
     * @example
     * Then I should receive a response within 500ms
     *
     * @function receiveWithinTime
     */
    Then('I should receive a response within {int}ms', async function(expectedTime) {
        // this Then should be called before all others!
        const startAt = process.hrtime();
        await this.req;
        const diff = process.hrtime(startAt);
        const responseTime = diff[0] * 1e3 + diff[1] * 1e-6; // i took this from https://github.com/dbillingham/superagent-response-time

        expect(responseTime).to.be.below(expectedTime);
    });

    /**
     * ### Then the response body json path at {jsonPath} should equal {expectedValue}
     * Ensure a JSON response body contains a given value at the JSON path
     * See [http://goessner.net/articles/JsonPath/](http://goessner.net/articles/JsonPath/)
     *
     * @example
     * Then the response body json path at "$.[1].name" should equal "Rover"
     *
     * @function responseBodyJsonPath
     */
    Then('the response body json path at {string} should equal {string}', async function(path, value) {
        const res = await this.req;
        const body = this.parseJsonResponse(res);
        const actualValue = JSONPath.eval(body, path)[0];
        expect(actualValue).to.equal(value);
    });

    /**
     * ### Then I should receive a response that sets the cookie
     * @todo Test and document me
     */
    Then('I should receive a response that sets the cookie', async function(expectedCookieData) {
        const {
            Name: cookieName,
            Value: cookieValue,
            ValueLength: cookieValueLength
        } = expectedCookieData.rowsHash();
        const res = await this.req;
        const cookieStr = res.header['set-cookie'].find(cookieStr => cookieStr.startsWith(cookieName));

        if(!cookieStr) {
            throw new Error(`Could not find set-cookie with name "${cookieName}`);
        }

        const parsedCookie = cookie.parse(cookieStr);

        if(cookieValue) {
            expect(cookieValue).to.be(parsedCookie[Name]);
        }
        if(cookieValueLength) {
            expect(parsedCookie[cookieName].length).to.be(parseInt(cookieValueLength));
        }
    });

    /**
     * ### Then the response body should validate against its response schema
     * @todo Test and document me
     */
    Then('the response body should validate against its response schema', async function() {
        const spec = await this.getEndpointSpec();
        const schema = spec.content['application/json'].schema;
        const validate = ajv.compile(schema);

        // get response
        const res = await this.req;
        // validate the response body
        const body = this.parseJsonResponse(res);

        const valid = validate(body);
        if (!valid){
            try {
                expect(valid).to.be.true;
            } catch (e) {
                expect.fail(null, null, JSON.stringify(validate.errors));
            }
            return;
        }
    });
}


module.exports = {
    registerSteps,
}
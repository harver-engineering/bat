const chai = require('chai');
const Ajv = require('ajv');
const cookie = require('cookie');
const JSONPath = require('jsonpath-plus');
const { expect } = chai;
const ajv = new Ajv();
const fs = require('fs');

const methodsWithBodies = [ 'POST', 'PUT', 'PATCH', 'DELETE'];

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
     * Construct a request to a resource using an HTTP method
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
     * |File_Name| 
     * |json1    |
     * @function addRequestBody
     */
    When('I add the request body:', async function (body) {
        // Read and send the json data
        this.req.send(readJson(body.rows()[0][0]));
    });

    /**
     * ### When I add the example request body
     * Adds a request body extracted from the open api spec for this request's resource and method
     * See the [test openapi.yaml](../test/openapi.yaml) for an example.
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
     * ### When I set the request header:
     * Set a header on the request using a data table
     *
     * @example
     * When I set the request header:
     *   | Name   | Accept-Language |
     *   | Value  | en              |
     *
     * @function setRequestHeaer
     */
    When('I set the request header:', function(headerData) {
        const { Name: name, Value: value } = headerData.rowsHash();
        this.req.set(name, value);
    });

    /**
     * ### When I set the cookie:
     * Set a cookie on the request using a data table
     *
     * @example
     * When I set the cookie:
     *   | Name   | foo |
     *   | Value  | bar |
     *   | Flags  | Expires=21 Oct 2015 07:28:00 GMT; Secure; HttpOnly; Path=\/ |
     *
     * @function setRequestCookie
     */
    When('I set the cookie:', function(cookieData) {
        const { Name: name, Value: value, Flags: flags } = cookieData.rowsHash();
        this.req.set('Cookie', `${name}=${value}${flags ? `;${flags}` : ''}`);
    });

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
     * @function populateRequestPathPlaceholder
     */
    When('I set the placeholder {string} using the json path {string} from the last {string} to {string}', function(placeHolder, jsonPath, previousMethod, previousPath){
        const previousResponse = this.retrieveResponse(previousPath, previousMethod);
        const placeHolderValue = JSONPath.eval(previousResponse, jsonPath)[0];
        const placeHolderRegex = new RegExp(`\{${placeHolder}\}`, 'g');

        this.req.url = this.req.url.replace(placeHolderRegex, placeHolderValue);

        // replace this placeholder in request body and query string
        if(this.req._data) {
            this.req._data = JSON.parse(
                JSON.stringify(this.req._data).replace(placeHolderRegex, placeHolderValue)
            );
        }

        if(this.req.qs) {
            this.req.qs = JSON.parse(
                JSON.stringify(this.req.qs).replace(placeHolderRegex, placeHolderValue)
            );
        }
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
        // (await will implictly call `then()` on the SuperAgent request object,
        // which will implicitly send the request)
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
        const body = this.getResponseBody(res);
        const actualValue = JSONPath.eval(body, path)[0];
        expect(actualValue).to.equal(value);
    });

    /**
     * ### Then I should receive a response that sets the cookie:
     *
     * Asserts that a response sent a cookie to the client
     *
     * @example
     * I should receive a response that sets the cookie
     *   | Name  | foo |
     *   | Value | bar |
     *
     * @function setResponseCookie
     */
    Then('I should receive a response that sets the cookie', async function(expectedCookieData) {
        const {
            Name: cookieName,
            Value: cookieValue,
            ValueLength: cookieValueLength
        } = expectedCookieData.rowsHash();
        const res = await this.req;
        const cookieStr = res.header['set-cookie'].find(cookieStr => cookieStr.startsWith(cookieName));
        const parsedCookie = cookie.parse(cookieStr);

        if(cookieValue) {
            expect(cookieValue).to.be(parsedCookie[Name]);
        }
        if(cookieValueLength) {
            expect(parsedCookie[cookieName].length).to.be(parseInt(cookieValueLength));
        }
    });

    //Function to get the json file data to feature files
    function readJson(schemaName) {
        try {
            //Read the json data from the file location
            const data = fs.readFileSync(`json/${schemaName}.json`, 'utf8');
            return data;
        }
        catch (err) {
            //Print the json file error
            body = err.body;
            console.log(body);
        }
    }

    // Function used for asserting a response validates against a given schema
    async function validateResponseAgainstSchema(schema) {
        const validate = ajv.compile(schema);

        // get response and validate its body against the schema
        const res = await this.req;
        const body = this.getResponseBody(res);
        const valid = validate(body);

        if (valid){
            expect(valid).to.be.true;
        } else {
            expect.fail(null, null, JSON.stringify(validate.errors));
        }
    }

    /**
     * ### Then the response body should validate against its response schema
     *
     * This will extract the response body json schemea from the Open API spec and
     * validate the current response body against it
     *
     * @example
     * Then the response body should validate against its response schema
     *
     * @function validateAgainstSchema
     */
    Then('the response body should validate against its response schema', async function() {
        const spec = await this.getEndpointSpec();
        const { schema } = spec.responses[200].content['application/json'];
        await validateResponseAgainstSchema.call(this, schema);
    });

    /**
     * ### Then the response body should validate against its response schema
     *
     * This allows to provide an inline response schema to validate the current
     * response body against. Generally not recommend because this can make the
     * feature file very verbose.
     *
     * @example
     * Then the response body should validate against the response schema:
     * """
     * { ... }
     * """
     *
     * @function validateAgainstInlineSchema
     */
    Then('the response body should validate against the response schema:', async function(schema) {
        await validateResponseAgainstSchema.call(this, JSON.parse(schema));
    });
}

module.exports = {
    registerSteps,
}
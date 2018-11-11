const chai = require('chai');
const Ajv = require('ajv');
const cookie = require('cookie');
const JSONPath = require('jsonpath-plus');
const { expect } = chai;
//const ajv = new Ajv();
const ajv = new Ajv({ schemaId: 'auto', unknownFormats: ['int32', 'int64', 'float'] });
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
const toJsonSchema = require('openapi-schema-to-json-schema');
const { readFile } = require('fs');
const { join } = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(readFile);

const methodsWithBodies = ['POST', 'PUT', 'PATCH', 'DELETE'];

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
    Given('I am anonymous', function () {
        // nothing to do
    });

    /**
     * ### Given I obtain an access token from {string} using the credentials:
     * Supports logging into using OAuth2 credentials, typically with the passwrod scheme
     * Sessions (access tokens) will be stored and supported for subsequent requests
     *
     * @example
     * Given I obtain an access token from {string} using the credentials:
     *  | client_id     | harver    |
     *  | client_secret | harver123 |
     *  | username      | gerald    |
     *  | password      | foobar    |
     *  | grant_type    | password  |
     *
     * @function obtainAccessToken
     */
    Given('I obtain an access token from {string} using the credentials:', async function (url, credentialsTable) {
        const credentials = credentialsTable.rowsHash();
        await this.getOAuthAccessToken(url, credentials);
    });

    /**
     * ### Given I obtain an access token from {string} using the credentials:
     * Supports logging into using OAuth2 credentials, typically with the password scheme
     * Sessions (access tokens) will be stored and supported for subsequent requests
     *
     * @example
     * Given I obtain an access token from '{base}/auth/token' using the credentials: '/path/to/user.json'
     *
     * @function obtainAccessTokenUsingFileCredentials
     */
    Given('I obtain an access token from {string} using credentials from: {string}', async function (url, filePath) {
        const envFile = await readFileAsync(join(process.cwd(), filePath), 'utf8');
        const keyFilter = ['client_id', 'client_secret', 'username', 'password', 'grant_type', 'refreshToken']
        const credentials = JSON.parse(envFile).values.reduce((acc, item) => {
            return item.enabled && item.value && keyFilter.includes(item.key) ?
                Object.assign(acc, { [item.key]: item.value }) :
                acc;
        }, {});
        await this.getOAuthAccessToken(url, credentials);
    });

    /**
     * ### I am using the default content type: {string}
     * Set a default Content-Type header for future requests. This is useful
     * as a step in a feature's "Background"
     *
     * @example
     * Given I am using the default content type: "application/json"
     *
     * @function defaultContentType
     */
    Given('I am using the default content type: {string}', function (contentType) {
        this.defaultContentType = contentType;
    });

    /**
     * ### Given I set the variables:
     * Explicitly state that the client is not authenticated
     *
     * @example
     * Given I am anonymous
     *
     * @function setVariables
     */
    Given(/^I set the variables?:$/, function (varTable) {
        const rows = varTable.rowsHash();
        this.userVars = this.userVars.concat(Object.keys(rows).reduce((acc, curr) => {
            return acc.concat([{
                key: curr,
                value: rows[curr],
            }])
        }, []));
    });

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // When
    // Setup the request
    ///////////////////////////////////////////////////////////////////////////////////////////////

    function makeRequest(method, url) {
        this.originalUrl = url;
        this.req = this.currentAgent[method.toLowerCase()](this.baseUrl + url);

        if (methodsWithBodies.includes(method)) {
            this.req.set('Content-Type', 'application/json');
        }
    }

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
    When('I send a {string} request to {string}', makeRequest);

    When(/^(POST|GET|PUT|PATCH|DELETE|HEAD) "([^"]+)"$/, makeRequest);

    /**
     * ### When I add the query string parameters:
     * Add query string paramaters defined in a Gherkin data table
     *
     * @example
     * When I add the query string parameters:
     *  | sort   | desc |
     *  | filter | red  |
     *
     * @function addQueryString
     */
    When('I add the query string parameters:', function (qs) {
        const queryObject = qs.rowsHash();
        this.req.query(queryObject);
    });

    // Shared code for sending request bodies
    // Be sure to call in Cucumber's "World" context!
    function addRequestBody(body, contentType = this.defaultContentType) {
        if (['form', 'json'].includes(contentType.toLowerCase())) {
            // super agent short forms
            this.req.type(contentType);
        } else {
            this.req.set('Content-Type', contentType);
        }

        this.req.send(body);
    }

    /**
     * ### When I add the request body
     * Add a JSON request body included in the Gherkin doc strings
     *
     * @example
     * When I add the request body
     * """
     * { "name" : "Ka", "type" : "Snake" }
     * """
     * @function addRequestBody
     */
    When('I add the request body:', function (body) {
        addRequestBody.call(this, body);
    });

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
     * @function addRequestBodyWithContentType
     */
    When('I add the {string} request body:', function (contentType, body) {
        // if body was a data table (and not a doc string)
        body = typeof body.rowsHash === 'function' ? body.rowsHash() : body;
        addRequestBody.call(this, body, contentType);
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

        this.req.send(body);
    });

    /**
     * ### When I add the request from json file: {filePath}
     * Add a JSON request body included in the Gherkin doc strings to the json file
     *
     * @example
     * I add the request from json file: '/test/files/json/sample-json'
     *
     * @function addRequestBodyFromFile
     */
    When('I add the request from json file: {string}', async function (fileName) {
        //Read the json data from the file location
        const body = await readFileAsync(join(process.cwd(), fileName), 'utf8');

        // Read and send the json data
        addRequestBody.call(this, body)
    });

    /**
     * ### When I set the request headers:
     * Set one or more request headers in a single step
     *
     * @example
     * When I set the request headers:
     *   | Content-Type     | application/json |
     *   | Accept-Language  | en               |
     *
     * @function setRequestHeaders
     */
    When(/^I set the request headers?:$/, function (tableData) {
        this.req.set(tableData.rowsHash());
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
     * @deprecated Use "When I set the cookies:" instead.
     * @function setRequestCookie
     */
    When('I set the cookie:', function (cookieData) {
        const { Name: name, Value: value, Flags: flags } = cookieData.rowsHash();
        this.req.set('Cookie', `${name}=${value}${flags ? `;${flags}` : ''}`);
    });

    /**
     * ### When I set the cookies:
     * Sets one or more cookies on the request using a data table
     *
     * @example
     * When I set the cookies:
     *  | Name | Value | Flags  |
     *  | foo  | bar   | path=/ |
     *
     * @function setRequestCookies
     */
    When('I set the cookies:', function (tableData) {
        const cookies = tableData.hashes();
        for (const cookie of cookies) {
            const { Name: name, Value: value, Flags: flags } = cookie;
            this.req.set('Cookie', `${name}=${value}${flags ? `;${flags}` : ''}`);
        }
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
    When('I set the placeholder {string} using the json path {string} from the last {string} to {string}', function (placeHolder, jsonPath, previousMethod, previousPath) {
        const previousResponse = this.retrieveResponse(this.replaceVars(previousPath), previousMethod);
        const placeHolderValue = JSONPath.eval(previousResponse, jsonPath)[0];

        this.responseVars.push({
            key: placeHolder,
            value: placeHolderValue,
        });
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
    Then('I should receive a response with the status {int}', async function (status) {
        // this sends the request
        // (await will implictly call `then()` on the SuperAgent request object,
        // which will implicitly send the request)
        const startAt = process.hrtime();
        try {
            this.req.use(this.replaceVariablesInitiator());
            const res = await this.req;
            this.saveCurrentResponse();
            expect(res.status).to.equal(status);
        } catch (err) {
            if (err.status) {
                expect(err.status).to.equal(status);
            } else {
                throw new Error(err);
            }
        } finally {
            const diff = process.hrtime(startAt);
            this.responseTime = diff[0] * 1e3 + diff[1] * 1e-6; // i took this from https://github.com/dbillingham/superagent-response-time
        }
    });

    /**
     * ### Then I should receive a response within {miliseconds}ms
     * Ensure the response was received within a time limit
     *
     * @example
     * Then I should receive a response within 500ms
     *
     * @function receiveWithinTime
     */
    Then('I should receive a response within {int}ms', async function (expectedTime) {
        expect(this.responseTime).to.be.below(expectedTime);
    });

    /**
     * ### Then the response header {string} should equal {string}
     * Ensure a response header equals the expect value
     *
     * @example
     * the response header "Content-Type" should equal "application/json"
     *
     * @function responseHeader
     */
    Then('the response header {string} should equal {string}', async function (headerName, value) {
        const res = await this.req;
        expect(res.header[headerName.toLowerCase()]).to.equal(this.replaceVars(value));
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
    Then('the response body json path at {string} should equal {string}', async function (path, value) {
        let body = null;

        try {
            const res = await this.req;
            body = this.getResponseBody(res);
        } catch (err) {
            body = err.response.body;
        }

        const actualValue = JSONPath.eval(body, path)[0];
        expect(actualValue).to.equal(this.replaceVars(value));
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
    Then('I should receive a response that sets the cookie', async function (expectedCookieData) {
        const {
            Name: cookieName,
            Value: cookieValue,
            ValueLength: cookieValueLength
        } = expectedCookieData.rowsHash();
        const res = await this.req;
        const cookieStr = res.header['set-cookie'].find(cookieStr => cookieStr.startsWith(cookieName));
        const parsedCookie = cookie.parse(cookieStr);

        if (cookieValue) {
            expect(cookieValue).to.be(parsedCookie[Name]);
        }
        if (cookieValueLength) {
            expect(parsedCookie[cookieName].length).to.be(parseInt(cookieValueLength));
        }
    });

    // Function used for asserting a response validates against a given schema
    async function validateResponseAgainstSchema(schema) {
        const validate = ajv.compile(toJsonSchema(schema));

        let body = null;
        try {
            // get response and validate its body against the schema
            const res = await this.req;
            body = this.getResponseBody(res);
        } catch (err) {
            body = err.body;
        }

        const valid = validate(body);

        if (valid) {
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
    Then('the response body should validate against its schema', async function () {
        const spec = await this.getEndpointSpec();
        const { schema } = spec.responses['200'].content['application/json'];
        await validateResponseAgainstSchema.call(this, schema);
    });

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
     * @function validateAgainstInlineSchema
     */
    Then('the response body should validate against the schema:', async function (schema) {
        await validateResponseAgainstSchema.call(this, JSON.parse(schema));
    });

    /**
     * ### Then the response body should validate against the schema from {string}
     *
     * This will load a response body json schemea from a file
     *
     * @example
     * Then the response body should validate against the schema from './path/to/schema.json'
     *
     * @function validateAgainstFileSchema
     */
    Then('the response body should validate against the schema from {string}', async function (filePath) {
        const schema = await readFileAsync(join(process.cwd(), this.replaceVars(filePath)), 'utf8');
        await validateResponseAgainstSchema.call(this, JSON.parse(schema));
    });

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // Some debug helpers
    ///////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * ### Debug: Print the request
     *
     * @function printRequest
     */
    Then('print the request', async function () {
        this.debug.push(`[debug] Showing request details for "${this.req.method}" to "${this.req.url}":\n`);
        this.debug.push(JSON.stringify(this.req, null, '  '));
    });

    /**
     * ### Debug: Print the response body
     *
     * @function printResponseBody
     */
    Then('print the response body', async function () {
        const res = await this.req;
        this.debug.push(`[debug] Showing response body for "${this.req.method}" to "${this.req.url}":\n`);
        this.debug.push(JSON.stringify(res.body, null, '  '));
    });
}

module.exports = {
    registerSteps,
}
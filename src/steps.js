const chai = require('chai');
const Ajv = require('ajv');
const cookie = require('cookie');
const JSONPath = require('jsonpath-plus');
const { expect } = chai;
const ajv = new Ajv();

const methodsWithBodies = [ 'POST', 'PUT', 'PATCH', 'DELETE'];
const placeHolderRegex = /[^{]+(?=})/g;

function registerSteps({ Given, When, Then }) {

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // Given
    // Background steps to sending a request
    ///////////////////////////////////////////////////////////////////////////////////////////////

    //
    Given('I am anonymous', function() {
        // nothing to do here
    });

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // When
    // Setup the request
    ///////////////////////////////////////////////////////////////////////////////////////////////

    // Note: this should always be the first "When"
    When('I send a {string} request to {string}', async function(method, path) {
        this.req = this.currentAgent[method.toLowerCase()](this.baseUrl + path);

        if(methodsWithBodies.includes(method)) {
            this.req.set('Content-Type', 'application/json');
        }
    });

    When('I add the query string parameters', function(qs) {
        const queryObject = qs.rowsHash();
        // handle multi-value queryParameters
        for (const prop in queryObject) {
            if (queryObject[prop].includes(',')){
                queryObject[prop] = queryObject[prop].split(',');
            }
        }
        this.req.query(queryObject);
    });


    When(/I add the request body( for the example, "[^"]*")?/, async function (body = null) {
        let examplePayload;
        if(body) {
            const spec = await this.getEndpointSpec();
            examplePayload = spec.requestBody.content['application/json'].example;
        } else {
            examplePayload = body;
        }

        // this doesn't actually send the request yet
        this.req.send(examplePayload);
    });

    When('I set the cookie:', function(cookieData) {
        // this uses a Gherkin data table:
        //
        // When I set the cookie:
        //   | Name   | foo |
        //   | Value  | bar |
        //   | Flags  | Expires=21 Oct 2015 07:28:00 GMT; Secure; HttpOnly; Path=/ |

        const { Name: name, Value: value, Flags: flags } = cookieData.rowsHash();
        this.req.set('Cookie', `${name}=${value};${flags}`);
    });

    When('I set the placeholder {string} with the response json path {string} from the last {string} to {string}', function(placeHolder, jsonPath, method, path){
        const parsedResponse = this.retrieveResponse(path, method);

        // Iterate over the string 'url' and replace any {placeHolders} if present with dynamic data from context
        const extractKeys = currentPath.match(placeHolderRegex) || [];

        for (const key of extractKeys) {
            const placeHolderValue = JSONPath.eval(parsedResponse, jsonPath)[0];
            currentPath = key === placeHolder ? currentPath.replace(`{${key}}`, placeHolderValue) : currentPath;
        }

        const method = this.currentMethod.toLowerCase();
        this.req = this.currentAgent[method](this.baseUrl + currentPath);
    });

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // Then
    // Send the request and run assertions on the response
    ///////////////////////////////////////////////////////////////////////////////////////////////

    // Note: This should always be the first "Then"
    Then('I should receive a response with the status {int}', async function(status) {
        // this sends the request
        // (await will implictly call `then()` on the SuperAgent request object)
        try {
            this.req.timeout({ response: 60000, deadline: 90000 });
            const res = await this.req;
            this.saveCurrentResponse();
            expect(res.status).to.equal(status);
        } catch(err) {
            throw new Error(err);
        }
    });

    Then('I should receive a response within {int}ms', function(expectedTime) {
        // this Then should be called before all others!
        const startAt = process.hrtime();

        const diff = process.hrtime(startAt);
        const responseTime = diff[0] * 1e3 + diff[1] * 1e-6; // i took this from https://github.com/dbillingham/superagent-response-time
        expect(responseTime).to.be.below(expectedTime);
    });

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

    Then('the response body contains the path {string} that equals {string}', async function(path, value) {
        const res = await this.req;
        const body = this.parseJsonResponse(res);
        const actualValue = JSONPath.eval(body, path)[0];
        expect(actualValue).to.equal(value);
    });
}

module.exports = {
    registerSteps,
}
// Copyright 2019 Harver B.V.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const chai = require('chai');
const Ajv = require('ajv');
const cookie = require('cookie');
const { JSONPath } = require('jsonpath-plus');
const ajv = new Ajv({ schemaId: 'auto', unknownFormats: ['int32', 'int64', 'float'] });
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
const toJsonSchema = require('openapi-schema-to-json-schema');
const { readFile } = require('fs');
const { join } = require('path');
const { promisify } = require('util');
const ql = require('superagent-graphql');
const readFileAsync = promisify(readFile);

chai.use(require('chai-match'));
chai.use(_chai => {
    // support assertions with == (vs ===)
    // this should be available in the future with Chai v5
    // https://github.com/chaijs/chai/issues/906
    _chai.Assertion.addMethod('equalLoosely', function (val) {
        const { _obj } = this;

        this.assert(
            val == _obj,
            'expected #{this} to equal #{exp}',
            'expected #{this} to not equal #{exp}',
            val,
            _obj,
            true,
        );
    });
});

const { expect } = chai;

const methodsWithBodies = ['POST', 'PUT', 'PATCH', 'DELETE'];

const redirectStatuses = [ 301, 302, 303, 307, 308 ];

function defaultContentType(contentType) {
    this.defaultContentType = contentType;
}

async function filterValuesFromEnvFile(filePath, keyFilter) {
    const envFile = await readFileAsync(join(process.cwd(), filePath), 'utf8');
    return JSON.parse(envFile).values
        .filter(item => item.enabled && item.value && keyFilter.includes(item.key))
        .reduce((acc, { key, value }) => ({
            ...acc,
            [key]: value,
        }), {});
}

function setCurrentAgentByRole(role) {
    if (this.getAgentByRole(role)) {
        this.currentAgent = this.getAgentByRole(role);
    } else {
        this.setAgentByRole(role, this.newAgent());
    }
}

async function basicAuth(credentialsTable) {
    const credentials = credentialsTable.rowsHash();
    this.setBasicAuth(credentials);
}

async function basicAuthUsingFileCredentials(filePath) {
    const keyFilter = ['username', 'password'];
    const credentials = await filterValuesFromEnvFile(filePath, keyFilter);
    this.setBasicAuth(credentials);
}

async function obtainAccessToken(url, credentialsTable) {
    const credentials = credentialsTable.rowsHash();
    await this.getOAuthAccessToken(url, credentials);
}

async function obtainAccessTokenUsingFileCredentials(url, filePath) {
    const keyFilter = ['client_id', 'client_secret', 'username', 'password', 'grant_type', 'refreshToken'];
    const credentials = await filterValuesFromEnvFile(filePath, keyFilter);
    await this.getOAuthAccessToken(url, credentials);
}

function setVariables(varTable) {
    const rows = varTable.rowsHash();
    this.userVars = this.userVars.concat(
        Object.entries(rows).map(([key, value]) => ({
            key,
            value,
        }))
    );
}

function makeRequest(method, url) {
    this.originalUrl = url;
    this.req = this.currentAgent[method.toLowerCase()](this.baseUrl + this.replaceVars(url));

    if (methodsWithBodies.includes(method)) {
        this.req.set('Content-Type', 'application/json');
    }
}

function makeGraphQLRequest(query) {
    this.req = this.currentAgent['post'](this.baseGraphQLUrl);
    this.req.use(ql(query));
}

function addQueryString(qs) {
    const queryObject = qs.rowsHash();
    this.req.query(queryObject);
}

// Shared code for sending request bodies
// Be sure to call in Cucumber's "World" context!
function _addRequestBody(body, contentType = this.defaultContentType) {
    if (['form', 'json'].includes(contentType.toLowerCase())) {
        // super agent short forms
        this.req.type(contentType);
    } else {
        this.req.set('Content-Type', contentType);
    }

    this.req.send(body);
}

function addRequestBodyWithContentType(contentType, body) {
    // if body was a data table (and not a doc string)
    _addRequestBody.call(this, typeof body.rowsHash === 'function' ? body.rowsHash() : body, contentType);
}

function addRequestBody(body) {
    _addRequestBody.call(this, body);
}

async function addRequestBodyFromFile(fileName) {
    //Read the json data from the file location
    const body = await readFileAsync(join(process.cwd(), fileName), 'utf8');

    // Read and send the json data
    _addRequestBody.call(this, body);
}

async function addRequestBodyFromExample() {
    const spec = await this.getEndpointSpec();
    const body = spec.requestBody.content['application/json'].example;

    this.req.send(body);
}

function setRequestCookies(tableData) {
    const cookies = tableData.hashes();
    for (const cookie of cookies) {
        const { Name: name, Value: value, Flags: flags } = cookie;
        this.req.set('Cookie', `${name}=${value}${flags ? `;${flags}` : ''}`);
    }
}

function setRequestHeaders(tableData) {
    this.req.set(tableData.rowsHash());
}

function populatePlaceholder(placeHolder, jsonPath, previousMethod, previousPath) {
    const previousResponse = this.retrieveResponse(previousPath, previousMethod);
    const placeHolderValue = JSONPath({ json: previousResponse, path: jsonPath })[0];

    this.responseVars.push({
        key: placeHolder,
        value: placeHolderValue,
    });
}

async function receiveResponseWithStatus(status) {
    // this sends the request
    // (await will implictly call `then()` on the SuperAgent request object,
    // which will implicitly send the request)
    const startAt = process.hrtime();
    try {
        // don't follow redirects if that's what is expected
        if(redirectStatuses.includes(status)) {
            this.req.redirects(0);
        }
        this.req.use(this.replaceVariablesInitiator());
        const res = await this.getResponse();
        this.saveCurrentResponse();
        expect(res.status).to.equal(status);
    } catch (err) {
        if (err.status) {
            expect(err.status).to.equal(status);
        } else {
            throw err;
        }
    } finally {
        const diff = process.hrtime(startAt);
        this.responseTime = diff[0] * 1e3 + diff[1] * 1e-6; // i took this from https://github.com/dbillingham/superagent-response-time
    }
}

async function receiveWithinTime(expectedTime) {
    expect(this.responseTime).to.be.below(expectedTime + this.latencyBuffer);
}

async function receiveText(expectedText) {
    const res = await this.getResponse();
    const actualText = res.text.trim();
    expect(actualText).to.equal(expectedText);
}

async function responseHeaderEquals(headerName, value) {
    const res = await this.getResponse();
    expect(res.header[headerName.toLowerCase()]).to.equal(this.replaceVars(value));
}

async function responseBodyJsonPathEquals(path, value) {
    const { body } = await this.getResponse();
    const actualValue = JSONPath({ json: body, path })[0];
    expect(actualValue).to.equalLoosely(this.replaceVars(value));
}

async function responseBodyJsonPathMatches(path, value) {
    const { body } = await this.getResponse();
    const actualValue = JSONPath({ json: body, path })[0];
    expect(actualValue).to.match(new RegExp(value));
}

async function responseBodyJsonPathIsEmpty(path) {
    const { body } = await this.getResponse();
    const actualValue = JSONPath({ json: body, path })[0];
    expect(actualValue).to.be.empty;
}

async function responseCookieEquals(expectedCookieData) {
    const cookieData = expectedCookieData.hashes()[0];
    const { Name: cookieName, Value: cookieValue, ValueLength: cookieValueLength } = cookieData;

    const res = await this.getResponse();
    const cookieStr = res.header['set-cookie'].find(cookieStr => cookieStr.startsWith(cookieName));
    const parsedCookie = cookie.parse(cookieStr);

    if (cookieValue) {
        expect(cookieValue).to.be(parsedCookie[cookieName]);
    }
    if (cookieValueLength) {
        expect(parsedCookie[cookieName].length).to.be(parseInt(cookieValueLength));
    }
}

// Function used for asserting a response validates against a given schema
async function _validateResponseAgainstSchema(schema) {
    const validate = ajv.compile(toJsonSchema(schema));
    const { body } = await this.getResponse();
    const valid = validate(body);

    if (valid) {
        expect(valid).to.be.true;
    } else {
        expect.fail(null, null, JSON.stringify(validate.errors));
    }
}

async function validateAgainstSpecSchema() {
    const spec = await this.getEndpointSpec();
    const { schema } = spec.responses['200'].content['application/json'];
    await _validateResponseAgainstSchema.call(this, schema);
}

async function validateAgainstInlineSchema(schema) {
    await _validateResponseAgainstSchema.call(this, JSON.parse(schema));
}

async function validateAgainstFileSchema(filePath) {
    const schema = await readFileAsync(join(process.cwd(), this.replaceVars(filePath)), 'utf8');
    await _validateResponseAgainstSchema.call(this, JSON.parse(schema));
}

module.exports = {
    noop: () => { },
    defaultContentType,
    setCurrentAgentByRole,
    basicAuth,
    basicAuthUsingFileCredentials,
    obtainAccessToken,
    obtainAccessTokenUsingFileCredentials,
    setVariables,
    makeRequest,
    makeGraphQLRequest,
    addQueryString,
    addRequestBody,
    addRequestBodyWithContentType,
    addRequestBodyFromFile,
    addRequestBodyFromExample,
    setRequestCookies,
    setRequestHeaders,
    populatePlaceholder,
    receiveResponseWithStatus,
    receiveWithinTime,
    receiveText,
    responseHeaderEquals,
    responseBodyJsonPathEquals,
    responseBodyJsonPathMatches,
    responseBodyJsonPathIsEmpty,
    responseCookieEquals,
    validateAgainstSpecSchema,
    validateAgainstInlineSchema,
    validateAgainstFileSchema,
};

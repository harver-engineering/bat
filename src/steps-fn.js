const { expect } = require('chai');
const Ajv = require('ajv');
const cookie = require('cookie');
const JSONPath = require('jsonpath-plus');
const ajv = new Ajv({ schemaId: 'auto', unknownFormats: ['int32', 'int64', 'float'] });
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
const toJsonSchema = require('openapi-schema-to-json-schema');
const { readFile } = require('fs');
const { join } = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(readFile);

const methodsWithBodies = ['POST', 'PUT', 'PATCH', 'DELETE'];

function defaultContentType(contentType) {
    this.defaultContentType = contentType;
}

async function obtainAccessToken(url, credentialsTable) {
    const credentials = credentialsTable.rowsHash();
    await this.getOAuthAccessToken(url, credentials);
}

async function obtainAccessTokenUsingFileCredentials(url, filePath) {
    const envFile = await readFileAsync(join(process.cwd(), filePath), 'utf8');
    const keyFilter = ['client_id', 'client_secret', 'username', 'password', 'grant_type', 'refreshToken']
    const credentials = JSON.parse(envFile).values.reduce((acc, item) => {
        return item.enabled && item.value && keyFilter.includes(item.key) ?
            Object.assign(acc, { [item.key]: item.value }) :
            acc;
    }, {});
    await this.getOAuthAccessToken(url, credentials);
}

function setVariables(varTable) {
    const rows = varTable.rowsHash();
    this.userVars = this.userVars.concat(Object.keys(rows).reduce((acc, curr) => {
        return acc.concat([{
            key: curr,
            value: rows[curr],
        }])
    }, []));
}

function makeRequest(method, url) {
    this.originalUrl = url;
    this.req = this.currentAgent[method.toLowerCase()](this.baseUrl + this.replaceVars(url));

    if (methodsWithBodies.includes(method)) {
        this.req.set('Content-Type', 'application/json');
    }
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
    body = typeof body.rowsHash === 'function' ? body.rowsHash() : body;
    addRequestBody.call(this, body, contentType);
}

function addRequestBody(body) {
    _addRequestBody.call(this, body);
}

async function addRequestBodyFromFile(fileName) {
    //Read the json data from the file location
    const body = await readFileAsync(join(process.cwd(), fileName), 'utf8');

    // Read and send the json data
    addRequestBody.call(this, body)
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
    const previousResponse = this.retrieveResponse(this.replaceVars(previousPath), previousMethod);
    const placeHolderValue = JSONPath.eval(previousResponse, jsonPath)[0];

    this.responseVars.push({
        key: placeHolder,
        value: placeHolderValue,
    });
}

async function receiveRequestWithStatus(status) {
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
}

async function receiveWithinTime(expectedTime) {
    expect(this.responseTime).to.be.below(expectedTime);
}

async function responseHeaderEquals(headerName, value) {
    const res = await this.req;
    expect(res.header[headerName.toLowerCase()]).to.equal(this.replaceVars(value));
}

async function responseBodyJsonPathEquals(path, value) {
    let body = null;

    try {
        const res = await this.req;
        body = this.getResponseBody(res);
    } catch (err) {
        body = err.response.body;
    }

    const actualValue = JSONPath.eval(body, path)[0];
    expect(actualValue).to.equal(this.replaceVars(value));
}

async function responseCookieEquals(expectedCookieData) {
    const cookieData = expectedCookieData.hashes()[0];
    const { Name: cookieName, Value: cookieValue, ValueLength: cookieValueLength } = cookieData;

    const res = await this.req;
    const cookieStr = res.header['set-cookie'].find(cookieStr => cookieStr.startsWith(cookieName));
    const parsedCookie = cookie.parse(cookieStr);

    if (cookieValue) {
        expect(cookieValue).to.be(parsedCookie[Name]);
    }
    if (cookieValueLength) {
        expect(parsedCookie[cookieName].length).to.be(parseInt(cookieValueLength));
    }
}

// Function used for asserting a response validates against a given schema
async function _validateResponseAgainstSchema(schema) {
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
    defaultContentType,
    obtainAccessToken,
    obtainAccessTokenUsingFileCredentials,
    setVariables,
    makeRequest,
    addQueryString,
    addRequestBody,
    addRequestBodyWithContentType,
    addRequestBodyFromFile,
    addRequestBodyFromExample,
    setRequestCookies,
    setRequestHeaders,
    populatePlaceholder,
    receiveRequestWithStatus,
    receiveWithinTime,
    responseHeaderEquals,
    responseBodyJsonPathEquals,
    responseCookieEquals,
    validateAgainstSpecSchema,
    validateAgainstInlineSchema,
    validateAgainstFileSchema,
}
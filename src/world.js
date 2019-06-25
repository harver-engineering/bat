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

const { readFileSync } = require('fs');
const { isAbsolute, join, resolve } = require('path');
const { parse: parseUrl } = require('url');
const chalk = require('chalk');
const request = require('superagent');
const SwaggerParser = require('swagger-parser');

const agents = new Map();
const responseCache = new Map();
const getResponseCacheKey = (path, method, status) => `${path};${method};${status}`;

const { version } = require('../package.json');

let apiSepc = null;

/** @module World */

/**
 * State and stateful utilities can be shared between steps using an instance of "World"
 */
class World {
    constructor(...params) {
        this._req = null;
        this._currentAgent = null;

        this.defaultContentType = 'application/json';

        // Provide a base url for all relative paths.
        // Using a variable: `{base}/foo` is preferred though
        this._baseUrl = process.env.BASE_URL || '';
        this._latencyBuffer = process.env.LATENCY_BUFFER ? parseInt(process.env.LATENCY_BUFFER, 10) : 0;
        if(isNaN(this._latencyBuffer)) {
            throw new Error(`process.env.LATENCY_BUFFER is not an integer (${process.env.LATENCY_BUFFER})`)
        }

        const envFile = process.env.ENV_FILE || null;
        this.envVars = envFile ? JSON.parse(readFileSync(resolve(process.cwd(), envFile))).values : [];
        this.env = process.env.TEST_ENV || null;
        this.responseVars = [];
        this.userVars = [];
    }

    /**
     * Getter for the `baseUrl` used for all requests
     */
    get baseUrl() {
        return this._baseUrl;
    }

    /**
     * Getter for the currently active Superagent request object
     */
    get req() {
        return this._req;
    }

    /**
     * Setter for the active request
     */
    set req(val) {
        // TODO: make this configurable
        val.timeout({ response: 60000, deadline: 90000 });
        this._req = val;
    }

    /**
     * Getter for the current Superagent agent.
     * Reuse this agent in step definitions to preserve client sessions
     */
    get currentAgent() {
        if (!this._currentAgent) {
            this._currentAgent = this.newAgent();
            this._currentAgent.set('User-agent', `behavioral-api-tester/${version}`);
        }
        return this._currentAgent;
    }

    /**
     * Setter for the current Superagent agent.
     * Reuse this agent in step definitions to preserve client sessions
     */
    set currentAgent(agent) {
        this._currentAgent = agent;
    }

    /**
     * Getter for the full Open API spec
     */
    get apiSpec() {
        if (!apiSepc) {
            throw new Error('No API spec is loaded. This assertion cannot be performed.')
        }
        return apiSepc;
    }

    get latencyBuffer() {
        return this._latencyBuffer;
    }

    /**
     * Get part of the Open API spec for just a single endpoint (resource + method)
     */
    async getEndpointSpec() {
        const { originalUrl, url, method } = this.req;
        let { pathname } = parseUrl(originalUrl || url);
        pathname = decodeURI(pathname);

        // we want to keep variables in the pathname so they can be looked up,
        // but need to remove the host name variable if any:
        if (!pathname.startsWith('/')) {
            const tmpParts = pathname.split('/');
            tmpParts.shift();
            pathname = `/${tmpParts.join('/')}`.trim();
        }

        try {
            return this.apiSpec.paths[pathname][method.toLowerCase()];
        } catch (err) {
            console.warn(`Could not find "${method.toLowerCase()}:${pathname}" in the provided api spec (${err.message})`);
            return {};
        }
    }

    /**
     * Get an Oauth2 access token, by sending the credentials to the endpoint url
     * @param {*} url The full token url ()
     * @param {*} credentials
     */
    async getOAuthAccessToken(url, credentials) {
        const agentKey = `${credentials.client_id}:${credentials.username}`;
        let agent = this.getAgentByRole(agentKey);

        // do an oauth2 login
        if (!agent) {
            const res = await request
                .post(this.baseUrl + this.replaceVars(url))
                .type('form')
                .send(credentials);

            if (res.body.accessToken) {
                agent = this.newAgent();
                agent.set('Authorization', `Bearer ${res.body.accessToken}`);
            } else {
                throw new Error(`Could not authenticate with OAuth2:\n\t${res.body}`);
            }
        }

        // this also makes it the current agent
        this.setAgentByRole(agentKey, agent);
    }

    /**
     * Replace placeholders in a value with variables currently stored from
     * environemtn config and previous responses.
     *
     * @param {*} val
     */
    replaceVars(val) {
        const vars = [].concat(this.responseVars).concat(this.userVars).concat(this.envVars);

        if (!val) {
            return val;
        }

        // cheeky way to easily replace on whole objects:
        const placeHolders = vars.map(pair => pair.key).join('|');
        const regex = new RegExp(`\{(${placeHolders})\}`, 'g');
        return JSON.parse(JSON.stringify(val).replace(regex, (match, p1) => {
            const matchPair = vars.find(pair => pair.key === p1);
            return matchPair ? matchPair.value : match;
        }));
    }

    /**
     * Returns Super Agent middleware that replaces placeholders with
     * variables
     */
    replaceVariablesInitiator() {
        return req => {
            req.originalUrl = this.originalUrl || req.url;
            req.url = this.replaceVars(req.url);
            req.qs = this.replaceVars(req.qs);
            req.headers = this.replaceVars(req.headers);
            req.cookies = this.replaceVars(req.cookies);
            req._data = this.replaceVars(req._data);
            return req;
        };
    }

    /**
     * Creates and returns a new SuperAgent agent
     */
    newAgent() {
        return request.agent();
    }

    /**
     * Get a Superagent agent for a specific authorization role
     * @param {string} role The role, such as 'admin'
     */
    getAgentByRole(role) {
        return agents.get(role);
    }

    /**
     * Save a Superagent agent for a given authorization role
     * @param {string} role
     * @param {*} agent
     */
    setAgentByRole(role, agent) {
        this._currentAgent = agent;
        agents.set(role, agent);
    }

    /**
     * Gets the body from a response. Includes logic to parse
     * JSON from JSON responses that have an incorrect 'text/html' content type.
     * @param {} res A Superagent response object
     */
    async getResponse() {
        let res;

        try {
            res = await this.req;
        } catch (err) {
            res = err.response;
        }

        return res;
    }

    /**
     * Save the current response so its values can be used for future requests
     */
    async saveCurrentResponse() {
        const res = await this.getResponse();
        const { url, method } = this.req;
        const status = res.status.toString();
        const cacheKey = getResponseCacheKey(url.split('?')[0], method, status);
        responseCache.set(cacheKey, res.body);
    }

    /**
     * Retrieve a response cached by `saveCurrentResponse`
     * @param {} resource An HTTP resource
     * @param {*} method An HTTP method
     * @param {*} status The response status, defaults to 200
     */
    retrieveResponse(resource, method, status = 200) {
        return responseCache.get(getResponseCacheKey(resource, method, status));
    }
}

function reset() {
    this.debug = [];
    this.responseVars = [];
    this.userVars = [
        {
            key: 'timestamp',
            value: Date.now(),
        },
        {
            key: 'randomInt',
            value: Math.round(Math.random() * 1000),
        },
    ];
}

async function printDebug(info) {
    const sep = chalk.magenta.bold(new Array(80).fill('*').join(''));
    if (this.debug.length) {
        console.log('\n' + sep + '\n');
        for (const line of this.debug) {
            console.log(line);
        }
        console.log('\n' + sep + '\n');
    }
    if (info.result.status === 'failed') {
        let res;
        try {
            res = await this.req;
        } catch (err) {
            res = err.response;
        } finally {
            console.log('\n' + sep + '\n');
            console.log('Url:\n');
            console.log(this.req.url);
            console.log('\nResponse body:\n');
            console.log(res.body);
            console.log('\n' + sep + '\n');
        }

    }
}

async function loadApiSpec() {
    // load an open api spec
    const specFile = process.env.API_SPEC_FILE || null;
    if (specFile) {
        const specFilePath = isAbsolute(specFile) ? specFile : join(process.cwd(), specFile);
        try {
            apiSepc = await SwaggerParser.validate(specFilePath);
            console.log(`API Spec loaded from: ${specFile}`);
        } catch (err) {
            console.warn(err.message);
        }
    }
}

module.exports = {
    World,
    registerHooks: function ({ BeforeAll, Before, After }) {
        BeforeAll(loadApiSpec);
        Before(reset);
        After(printDebug);
    }
}

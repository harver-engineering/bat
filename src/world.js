const { isAbsolute, join } = require('path');
const { parse: parseUrl } = require('url');
const request = require('superagent');
const SwaggerParser = require('swagger-parser');

const agents = new Map();
const responseCache = new Map();
const getResponseCacheKey = (path, method, status) => `${path};${method};${status}`;

let apiSepc = null;

/** @module World */

/**
 * State and stateful utilities can be shared between steps using an instance of "World"
 */
class World {
    constructor() {
        this._req = null;
        this._currentAgent = null;

        this._baseUrl = process.env.BASE_URL || null;
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
     * Getter for the curren Superagent agent.
     * Reuse this agent in step definitions to preserve client sessions
     */
    get currentAgent() {
        if(!this._currentAgent) {
            this._currentAgent = request.agent();
        }
        return this._currentAgent;
    }

    /**
     * Getter for the full Open API spec
     */
    get apiSpec() {
        if(!apiSepc) {
            throw new Error('No API spec is loaded. This assertion cannot be performed.')
        }
        return apiSepc;
    }

    /**
     * Get part of the Open API spec for just a single endpoint (resource + method)
     */
    async getEndpointSpec() {
        const { url, method } = this.req;
        const { pathname } = parseUrl(url);

        try {
            return this.apiSpec.paths[pathname][method.toLowerCase()];
        } catch(err) {
            console.warn(err.message);
            return {};
        }
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
        this.currentAgent = agent;
        agents.set(role, agent);
    }

    /**
     * Gets the body from a response. Includes logic to parse
     * JSON from JSON responses that have an incorrect 'text/html' content type.
     * @param {} res A Superagent response object
     */
    getResponseBody(res) {
        if(res.header['content-type'].startsWith('text/html')) {
            return JSON.parse(res.text);
        }
        return res.body;
    }

    /**
     * Save the current response so its values can be used for future requests
     */
    async saveCurrentResponse() {
        const res = await this.req;
        const { url, method } = this.req;
        const status = res.status.toString();
        const cacheKey = getResponseCacheKey(parseUrl(url).pathname, method, status);
        responseCache.set(cacheKey, this.getResponseBody(res));
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

async function loadApiSpec() {
  // load an open api spec
  const specFile = process.env.API_SPEC_FILE || null;
  if(specFile) {
      const specFilePath = isAbsolute(specFile) ? specFile : join(process.cwd(), specFile);
      try {
          apiSepc = await SwaggerParser.validate(specFilePath);
      } catch(err) {
          console.warn(err.message);
      }
  }
}

module.exports = {
    World,
    registerHooks: function({ BeforeAll }) {
        BeforeAll(loadApiSpec)
    }
}

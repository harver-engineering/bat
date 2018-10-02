const { isAbsolute, join } = require('path');
const request = require('superagent');
const SwaggerParser = require('swagger-parser');

const agents = new Map();
const responseCache = new Map();
const getResponseCacheKey = (path, method, status) => `${path};${method};${status}`;

let apiSepc = null;

// state and stateful utilities can be shared between steps using "World"
class World {
    constructor() {
        this._req = null;
        this._currentAgent = null;

        this._baseUrl = process.env.BASE_URL || null;
    }

    get baseUrl() {
        return this._baseUrl;
    }

    get req() {
        return this._req;
    }

    set req(val) {
        // TODO: make this configurable
        val.timeout({ response: 60000, deadline: 90000 });
        this._req = val;
    }

    get currentAgent() {
        if(!this._currentAgent) {
            this._currentAgent = request.agent();
        }
        return this._currentAgent;
    }

    get apiSpec() {
        if(!apiSepc) {
            throw new Error('No API spec is loaded. This assertion cannot be performed.')
        }
        return apiSepc;
    }

    async getEndpointSpec() {
        const res = await this.req;
        const { path, method } = this.req;
        const status = res.status.toString();

        try {
            return this.apiSpec.paths[path][method.toLowerCase()].responses[status];
        } catch(err) {
            console.warn(err.message);
            return {};
        }
    }

    getAgentByRole(role) {
        return agents.get(role);
    }

    setAgentByRole(role, agent) {
        this.currentAgent = agent;
        agents.set(role, agent);
    }

    parseJsonResponse(res) {
        if(res.header['content-type'].startsWith('text/html')) {
            return JSON.parse(res.text);
        }
        return res.body;
    }

    async saveCurrentResponse(response) {
        const res = await this.req;
        const { path, method } = this.req;
        const status = res.status.toString();
        responseCache.set(getResponseCacheKey(path, method, status), response);
    }

    retrieveResponse(path, method, status = 200) {
        return responseCache.get(getResponseCacheKey(path, method, status));
    }
}

module.exports = {
    World,
    registerHooks: function({ BeforeAll }) {
        BeforeAll(async function() {
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
        })
    }
}

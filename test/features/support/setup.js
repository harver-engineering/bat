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

const url = require('url');
const http = require('http');
const { setWorldConstructor, After, AfterAll, Before, BeforeAll, Given, When, Then } = require('cucumber');
const { registerHooks, World: BaseWorld, registerSteps } = require('../../../src/index');

class World extends BaseWorld {
    constructor(...args) {
        super(...args);
    }
}

setWorldConstructor(World);
registerHooks({ After, AfterAll, Before, BeforeAll });
registerSteps({ Given, Then, When });

process.env.GRAPHQL_BASE_URL = 'http://localhost:3000/graphql';

// a custom login step
Given('I am logged in as a {string}', async function (role) {
    // does an agent for this role already exist?
    const roleAgent = this.getAgentByRole(role);
    if (roleAgent) {
        this.setAgentByRole(role, roleAgent);
        return;
    }

    // construct and send a login request
    const agent = this.newAgent();
    const req = agent.post(this.replaceVars('{base}/my-login'));

    await req.send({
        // this gets predefined credentials for this role from the `env/dev.json` file
        username: this.replaceVars(`{${role}_user}`),
    });
    this.setAgentByRole(role, agent);
});

AfterAll(function (done) {
    const options = url.parse(require('../../env/dev.json').values.find(val => val.key === 'base').value);
    const req = http.request({ ...options, path: '/reset' }, () => done());
    req.end();
});

process.on('unhandledRejection', reason => {
    console.error('\nThere was an unhandled rejection: "%s"', reason);
    console.log(reason);
});

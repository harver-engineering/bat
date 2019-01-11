const { setWorldConstructor, After, AfterAll, Before, BeforeAll, Given, When, Then } = require('cucumber');
const { registerHooks, World: BaseWorld, registerSteps } = require('../../../src/index');

class World extends BaseWorld {
    constructor() {
        super();
    }
}

setWorldConstructor(World);
registerHooks({ After, AfterAll, Before, BeforeAll });
registerSteps({ Given, Then, When });

// a custom login step
Given('I am logged in as a {string}', async function(role) {
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

process.on('unhandledRejection', reason => {
    console.error('\nThere was an unhandled rejection: "%s"', reason);
    console.log(reason);
});
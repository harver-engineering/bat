const { setWorldConstructor, After, AfterAll, Before, BeforeAll, Given, When, Then } = require('cucumber');
const { registerHooks, World: BaseWorld, registerSteps } = require('../../../src/index');

class World extends BaseWorld {
    constructor() {
        super();
        // project specific world code would go here
    }
}

setWorldConstructor(World);
registerHooks({ After, AfterAll, Before, BeforeAll });
registerSteps({ Given, Then, When });
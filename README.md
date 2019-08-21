Bat 🦇 - Behavioral API Tester &middot; [![Build Status](https://travis-ci.org/harver-engineering/bat.svg?branch=master)](https://travis-ci.org/harver-engineering/bat) ![npm](https://img.shields.io/npm/v/bat)
==============================

A [Gherkin](https://docs.cucumber.io/gherkin/) based DSL for testing HTTP APIs via [Cucumber.JS](https://github.com/cucumber/cucumber-js).

* Write RESTful/HTTP API tests in plain English.
* Integrates with Open API specs.
* Easily extend with [Cucumber.JS](https://github.com/cucumber/cucumber-js).

```gherkin
    Given I am anonymous
    When I send a 'GET' request to '{base}/pets'
    And I add the query string parameters:
        | sort   | desc   |
        | filter | mammal |
    Then I should receive a response with the status 200
    And I should receive a response within 1000ms
    And the response body json path at "$.[1].name" should equal "Rover"
```

See the [step definition reference](./docs/step-reference.md) for a complete
list of all the available `Given`, `When` and `Then` steps.

## Contents

 * Install
 * Get started
 * Tips
 * Extending
 * Reference

## Install

```
npm i --save-dev @harver/bat
```

## Get started

### 1. Install Cucumber.JS:

`npm install --save-dev cucumber`

### 2. Create the file `features/support/setup.js` with the following code:

```javascript
const {
    setWorldConstructor,
    After, AfterAll, Before, BeforeAll,
    Given, When, Then
} = require('cucumber');
const { registerHooks, World, registerSteps } = require('@harver/bat');

setWorldConstructor(World);

// Allow Bat to hook into your Cucumber dependencty:
registerHooks({ Before, BeforeAll, After, AfterAll });
registerSteps({ Given, Then, When });
```

### 3. Write feature files and scenarios

`features/some-scenario.feature`:

```gherkin
Scenario: Testing Gets
    When I send a 'GET' request to '{base}/pets'
    And I add the query string parameters:
        | sort   | desc |
        | filter | red  |
    Then I should receive a response with the status 200
    And I should receive a response within 1000ms
    And the response body json path at "$.[1].name" should equal "Rover"
```

See the [Steps Reference](./docs/step-reference.md) for documentation on all available steps.

## Tips

### Use a Postman compatible environment file to define variables:

`ENV_FILE=env/uat.json cucumber-js`

The env file will look like this:

```json
{
    "values": [
        {
            "key": "base",
            "value": "http://localhost:3000"
        }
    ]
}
```

You may then reference this variables, in your steps, like so:

```gerkhin
When I send a 'GET' request to '{base}/pets'
```

### Integrate with an Open API 3 specification:

`API_SPEC_FILE=test/openapi.yaml cucumber-js`

An Open API spec can be used in conjunction with provided steps, such as
extracting example request bodies or validating responses against their
schemas.

### Step short forms

Steps are written in a readable English form, but this can seem quite verbose. Therefore most steps have alternative short form. For example:

```gherkin
Scenario: Testing short forms
    When GET '/pets'
    And qs:
        | sort   | desc    |
        | filter | mammal  |
    Then receive status 200
    And within 1000ms
    And json path at "$.[1].name" should equal "Rover"
```

### Adding a latency buffer

If you are using the `I should receive a response within {int}ms` step on a network connection you expect to be unusually slow,
you can add pad the time of all these steps using the `LATENCY_BUFFER` environment variable:

`LATENCY_BUFFER=1000 cucumber-js`

This example allows an extra second for all requests to complete.

## Extending

Under the hood, Bat uses [SuperAgent](https://visionmedia.github.io/superagent/) for making HTTP requests. You can get a new SuperAgent agent without requiring SuperAgent directly as a dependency by calling `this.newAgent()` within a custom
step definition:

```js
const agent = this.newAgent();
```

Bat also maintains a cache of agents that persists across Cucumber scenarios. This
means that if each scenario uses a `Given` step to set up some authorization, an HTTP session or Bearer token can be reused without needing to re-login every time.

The code example below (taken from the tests), demonstrates a custom `Given` step
for logging in and maintaining a client session:

```gherkin
const { setWorldConstructor, After, AfterAll, Before, BeforeAll, Given, When, Then } = require('cucumber');
const { registerHooks, World, registerSteps } = require('@harver/bat');

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

    // this also sets `this.currentAgent` so this agent will be used
    // for creating the next request.
    this.setAgentByRole(role, agent);
});
```

See the [Cucumber.JS](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/step_definitions.md) documentation for more information on writing step definitions.


## Reference

[Steps reference](./docs/step-reference.md) for support writing feature files.

[World API](./docs/world-api.md) for support writing custom step definitions.
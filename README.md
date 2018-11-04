# BDD (Cucumber) API Tester

A Gherkin DSL for testing REST APIs via Cucumber.JS.

## Install

```
cd my-repo
npm i --save-dev gti+ssh://git@bitbucket.org:harver/bdd-api-tester.git
```

## Usage

### 1. Install `cucumber`:

`npm install --save-dev cucumber`

### 2. Create `features/support/setup.js` with the following code:

```javascript
const {
    setWorldConstructor,
    After, AfterAll, Before, BeforeAll,
    Given, When, Then
} = require('cucumber');
const { registerHooks, World: BaseWorld, registerSteps } = require('bdd-api-tester');

// Create a custom world that extends the `BaseWorld`
class World extends BaseWorld {
    constructor() {
        super();
        // project specific world code would go here
    }
}
setWorldConstructor(World);

// register hooks and steps defined by the libary
registerHooks({ Before, BeforeAll, After, AfterAll });
registerSteps({ Given, Then, When });

// project specific hooks and steps...
Given('I am logged in', function() {
    // do stuff to log in
})
```

### 3. Write feature files and scenarios

`features/some-scenario.feature`:

```gherkin
Scenario: Testing Gets
    When I send a 'GET' request to '/pets'
    And I add the query string parameters
        | sort   | desc |
        | filter | red  |
    Then I should receive a response within 1000ms
    And I should receive a response with the status 200
    And the response body json path at "$.[1].name" should equal "Rover"
```

### 4. Run Cucumber with configuration using environment variables:

#### Setting a base URL:

Simple way to prefix all relative urls used in the tests:

`BASE_URL=http://localhost:3000 cucumber-js`

#### Provide an Open API 3 specification:

`API_SPEC_FILE=test/openapi.yaml cucumber-js`

#### Use a Postman compatible environment file to define variables:

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

## Reference

[Steps reference](./step-reference.md) for support writing feature files.

[World API](./world-api.md) for support writing custom step definitions.
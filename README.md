# BDD (Cucumber) API Tester

A Gherkin DSL for testing REST APIs via Cucumber.JS.

## Install

We don't have an NPM registry yet. Clone this repo and run `npm pack`. Install the resulting tarball
file in the target package. E.g.

```
cd my-repo
npm i --save-dev bdd-api-tester-0.1.0.tgz
```

## Usage

### 1. Install `cucumber`:

`npm install --save-dev cucumber`

### 2. Create `features/setup.js`:

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

### 3. Write Feature files and Scenarios

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

`BASE_URL=http://localhost:3000 API_SPEC_FILE=test/openapi.yaml cucumber-js`

## Reference

[Steps reference](./STEPS.md)
Contributing Guide
============================

## About the codebase

### Source code

The `src` directory contains `index.js` plus three main files:

* **`world.js`**: The Cucumber.js [*World*](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/world.md) constructor. An instance of Bat's `World` constructor is the context that all Bat Cucumber steps are called in. It provide shared state and utilites per scenario.
* **`steps.js`**: Contains all Bat's Cucubmer step definitions (`Given`, `When` and `Then`).
* **`steps-fn.js`**: To manage duplicate step definitions (long and short forms) their implementations are kept
  separately, in order to cleanly share them.

All Javascript is linted using a basic Eslint ruleset.

### Tests

Bat's testing setup works by running Cucumber scenarios which run its own step definitions (`test/features`) against a mock server (`test/server.js`) that provides pre-defined, expected responses.

Run tests with `npm test`. This will start the mock server, run the Cucumber tests and then kill the server.

### Reference documentation

Code in `src/world.js` and `src/steps.js` is documented using inline [JSDoc](http://usejsdoc.org/). E.g.

```js
/**
 * ### When I add the query string parameters:
 * Add query string paramaters defined in a Gherkin data table
 *
 * @example
 * When I add the query string parameters:
 *  | sort   | desc |
 *  | filter | red  |
 *
 * @example <caption>Short form</caption>
 * When qs:
 *  | sort   | desc |
 *  | filter | red  |
 *
 * @function addQueryString
*/
```

 The JSDoc should contain the actual step definition as its heading, a [description](http://usejsdoc.org/tags-description.html) and [examples](http://usejsdoc.org/tags-example.html). Where a step definition has both
 a short and long from, all the documentation should be in one place, within the long form docs, containing examples for both short and
 long forms. A nuance of the doc generation process means you must also include a [`@function`](http://usejsdoc.org/tags-function.html) tag

 Running `npm run docs` will generate markdown documents in the `docs` directory based on the JSDoc. Updates to these files should be committed
 alongside new code.

## Writing a new step definition

### Checklist

1. Write BDD style specs (and get feedback)
2. Implement the definition
3. Implementt the definition implemention
4. Write and generate the inline documentation
5. Use conventional commits for your commit message

### Code by example

We recommend you take a BDD approach, so first write a Cucumber scenario in `test/features/test-steps.feature`. Always write a
"long form" of your step definition and ensure it is correct English. If you need to the test server to support the
step, add or modify endpoints in `test/server.js`. For unimaginative reasons, the server uses a "pets" theme.

At this point you should have one failing scenario when running `npm test`. To only run this test, add a temporary
[Cucumber tag](https://docs.cucumber.io/cucumber/api/#tag-expressions) to the scenario and run:

`npm run test -- --tags @mytag`

If you are planning to create a Pull Request to have the code integrated back into the main Bat codebase, it's a good idea to create a WIP/draft PR at this stage, to get feedback, before working on the implementation.

### Implement the definiton

Add the new `Given`, `When` or `Then` to `steps.js` and then write its implementation in `steps-fn.js`. See other steps for examples.

Methods and fields of world can be referenced via `this` (see the
[world reference docs](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/world.md)). For this reason, they must also be written using the `function` keyword rather than as arrow functions.

Some useful fields and methods supplied by the function context you can use are:

##### `this.req`

Gets a reference to the current request. This a [SuperAgent](https://visionmedia.github.io/superagent/) request object that
is built up during the `Given` and `When` phases.

```js
function setCustomHeder(customHeader) {
    this.req.set({
        'My-Custom-Header': customHeader
    });
})
```

The first time `.then()` is called on `this.req` (or `await this.req`) it will be sent. This usually happends when the
`Then I should receive a response with the status {number}` step is used.

##### `this.getResponse()`

Use this in `Then` steps (assertions);

```js
const { body } = await this.getResponse();
```

#### Assertions

Bat uses [Chai](https://www.chaijs.com/api/bdd/) to perform assertions:

```js
async function receiveText(expectedText) {
    const res = await this.getResponse();
    const actualText = res.text.trim();
    expect(actualText).to.equal(expectedText);
}
```

#### Docs

Ensure the step definition in `steps.js` has JSDoc which clearly explains how to use it.

Run `npm run docs` to generate the markdown documentation as part of this changeset.

### Commits

Please use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0-beta.3/) and write a [good commit message](https://chris.beams.io/posts/git-commit/).

### License

Please ensure that all source files, existing and new, begin with the [Apache License Version 2.0](https://www.apache.org/licenses/LICENSE-2.0) boilerplate.


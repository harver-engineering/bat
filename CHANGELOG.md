# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

# 0.7.0 (2019-02-22)


### Bug Fixes

* Add `newAgent()` helper ([1ee2a9a](https://github.com/harver-bv/bat/commit/1ee2a9a))
* Cookies not persisted when using {base} variable in url ([6f38f38](https://github.com/harver-bv/bat/commit/6f38f38))
* Fixed schema lookup not using `req.originalUrl` ([558504e](https://github.com/harver-bv/bat/commit/558504e))
* Missing setter for world.currentAgent ([63f186b](https://github.com/harver-bv/bat/commit/63f186b))
* Print response body if response status is 4.xx or 5.xx ([56f283e](https://github.com/harver-bv/bat/commit/56f283e))
* Update dependencies ([ac39918](https://github.com/harver-bv/bat/commit/ac39918))
* Use rowHash instead of hashes for headers data tables ([61b10d6](https://github.com/harver-bv/bat/commit/61b10d6))
* When adding req body, provided content type not overriding default content type ([d747cb3](https://github.com/harver-bv/bat/commit/d747cb3))


### Features

* Add "Then I should receive the text:" step ([2a7ce9e](https://github.com/harver-bv/bat/commit/2a7ce9e))
* Add a "latency buffer" to pad request time assertions on slow connections ([9190bf2](https://github.com/harver-bv/bat/commit/9190bf2))
* Add support for login with OAuth 2 ([2baf1eb](https://github.com/harver-bv/bat/commit/2baf1eb))
* Provide short forms of steps ([870c986](https://github.com/harver-bv/bat/commit/870c986))
* Support Postman envs and 'application/x-www-form-urlencoded' content types ([284cc86](https://github.com/harver-bv/bat/commit/284cc86))
* Support Postman envs and 'application/x-www-form-urlencoded' content types ([9807ee0](https://github.com/harver-bv/bat/commit/9807ee0))
* Support Postman envs and 'application/x-www-form-urlencoded' content types ([4968916](https://github.com/harver-bv/bat/commit/4968916))
* Updates/maturity to support Harver public API ([a3c09c1](https://github.com/harver-bv/bat/commit/a3c09c1))


### BREAKING CHANGES

* The step "When I add the query string parameters" must now be
suffixed with a colon. E.g.

`When I add the query string parameters:`
* The step "When I add the query string parameters" must now be
suffixed with a colon. E.g.

`When I add the query string parameters:`
* The step "When I add the query string parameters" must now be
suffixed with a colon. E.g.

`When I add the query string parameters:`

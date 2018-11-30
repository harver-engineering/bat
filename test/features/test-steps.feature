Feature: API Testing Steps
  As an author of this library
  I want to test that all the steps work against a mock server
  So I can sleep at night

  Background: Anonymous usage
    Given I am anonymous
    Given I set the variables:
      | color | red |
      | lang  | nl  |

  @long
  Scenario: Testing Gets
    When GET "{base}/pets"
    And I add the query string parameters:
      | sort   | desc        |
      | filter | {color}     |
      | time   | {timestamp} |
    And I set the cookie:
      | Name | Value | Flags  |
      | foo  | bar   | path=/ |
    And I set the request header:
      | Name  | Accept-Language |
      | Value | {lang}          |
    And I set the request header:
      | Name  | Content-Type     |
      | Value | application/json |
    Then I should receive a response with the status 200
    And I should receive a response within 1000ms
    And the response body should validate against its schema
    And the response body should validate against the schema:
      """
      {
      "type": "array",
      "items": {
      "allOf": [
      {
      "required": [
      "name"
      ],
      "properties": {
      "name": {
      "type": "string"
      },
      "tag": {
      "type": "string"
      }
      }
      },
      {
      "required": [
      "id"
      ],
      "properties": {
      "id": {
      "type": "string"
      },
      "name": {
      "type": "string"
      },
      "type": {
      "type": "string"
      }
      }
      }
      ]
      }
      }
      """
    And the response body json path at "$.[1].name" should equal "Rover"
    And the response header "Content-Language" should equal "en"

  @long
  Scenario: Testing Alternative Table Syntax for multiples
    When I send a 'GET' request to '{base}/pets'
    And I add the query string parameters:
      | sort   | desc        |
      | filter | red         |
      | time   | {timestamp} |
    And I set the cookies:
      | Name | Value | Flags  |
      | foo  | bar   | path=/ |
    And I set the request headers:
      | Accept-Language | nl               |
      | Content-Type    | application/json |
    And I should receive a response with the status 200

  @long
  Scenario: Testing Posts
    When I send a 'POST' request to '{base}/pets'
    And I add the request body:
      """
      { "name" : "Ka", "type" : "Snake" }
      """
    Then I should receive a response with the status 201

  @long
  Scenario: Testing urlencoded bodies
    When I send a 'POST' request to '{base}/pets/form'
    And I add the 'form' request body:
      | name | Otis       |
      | type | Chimpanzee |
    Then I should receive a response with the status 201

  @long
  Scenario: Testing Posts using json file
    When I send a 'POST' request to '{base}/pets'
    And I add the request body from the file: './test/files/json/sample-json.json'
    Then I should receive a response with the status 201

  @long
  Scenario: Testing openapi spec intergration
    When I send a 'POST' request to '{base}/pets'
    And I add the query string parameters:
      | useSpec | true |
    And I add the example request body

  @long
  Scenario: Reuse previous values
    When I send a 'PUT' request to '{base}/pets/{id}'
    And I add the request body:
      """
      { "id" : "{id}" }
      """
    And I add the query string parameters:
      | id | {id} |
    And I set the placeholder 'id' using the json path '$.[0].id' from the last 'GET' to '{base}/pets'
    Then I should receive a response with the status 200
    And the response body json path at "$.name" should equal "Felix"

  Scenario: Can Test status code 4**
    When I send a 'PUT' request to '{base}/pets/5000'
    Then I should receive a response with the status 418
    And the response body json path at "$.message" should equal "'5000' == '1000'"
    Then print the response body

  @long
  @oauth
  Scenario: Testing OAuth support
    Given I obtain an access token from '{base}/auth/token' using the credentials:
      | client_id | 123    |
      | username  | jayani |
    When I send a 'GET' request to '{base}/secret/jayani'
    Then I should receive a response with the status 201
    Then print the response body
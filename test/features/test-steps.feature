Feature: API Testing Steps
  As an author of this library
  I want to test that all the steps work against a mock server
  So I can sleep at night

  Background: Anonymous usage
    Given I am anonymous

  Scenario: Testing Gets
    When I send a 'GET' request to '{base}/pets'
    And I add the query string parameters:
      | sort   | desc |
      | filter | red  |
    And I set the cookie:
      | Name  | foo    |
      | Value | bar    |
      | Flags | path=/ |
    And I set the request header:
      | Name  | Accept-Language |
      | Value | nl              |
    And I set the request header:
      | Name  | Content-Type     |
      | Value | application/json |
    Then I should receive a response within 1000ms
    And I should receive a response with the status 200
    And the response body should validate against its response schema
    And the response body should validate against the response schema:
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

  Scenario: Testing Alternative Table Syntax for multiples
    When I send a 'GET' request to '{base}/pets'
    And I add the query string parameters:
      | sort   | desc |
      | filter | red  |
    And I set the cookies:
      | Name | Value | Flags  |
      | foo  | bar   | path=/ |
    And I set the request headers:
      | Name            | Value            |
      | Accept-Language | nl               |
      | Content-Type    | application/json |
    And I should receive a response with the status 200

  Scenario: Testing Posts
    When I send a 'POST' request to '{base}/pets'
    And I add the request body:
      """
      { "name" : "Ka", "type" : "Snake" }
      """
    Then I should receive a response with the status 201

  Scenario: Testing urlencoded bodies
    When I send a 'POST' request to '{base}/pets/form'
    And I add the 'form' request body:
      | Name | Value      |
      | name | Otis       |
      | type | Chimpanzee |
    Then I should receive a response with the status 201

  Scenario: Testing openapi spec intergration
    When I send a 'POST' request to '{base}/pets'
    And I add the query string parameters:
      | useSpec | true |
    And I add the example request body

  Scenario: Reuse previous values
    When I send a 'PUT' request to '{base}/pets/{id}'
    And I add the request body:
      """
      { "id" : "{id}" }
      """
    And I add the query string parameters:
      | id | {id} |
    And I set the placeholder 'id' using the json path '$.[0].id' from the last 'GET' to '/pets'
    Then I should receive a response with the status 200
    And the response body json path at "$.name" should equal "Felix"


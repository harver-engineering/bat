Feature: API Testing Steps
  As an author of this library
  I want to test that all the steps work against a mock server
  So I can sleep at night

  Background: Anonymous usage
    Given I am anonymous
    Given I set the variables:
      | color | red |
      | lang  | nl  |

  @short
  Scenario: Testing Gets
    When GET "{base}/pets"
    And qs:
      | sort   | desc        |
      | filter | {color}     |
      | time   | {timestamp} |
    And set cookie:
      | Name  | Value | Flags |
      | foo   | bar     | path=/   |
    And set:
      | Name  | Accept-Language |
      | Value | {lang}          |
    And set:
      | Name  | Content-Type     |
      | Value | application/json |
    Then receive status 200
    And within 1000ms
    And validate against schema
    And validate against the schema:
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
    And json path at "$.[1].name" should equal "Rover"
    And the response header "Content-Language" should equal "en"

  @short
  Scenario: Testing Alternative Table Syntax for multiples
    When GET "{base}/pets"
    And qs:
      | sort   | desc        |
      | filter | red         |
      | time   | {timestamp} |
    And set cookies:
      | Name | Value | Flags  |
      | foo  | bar   | path=/ |
    And set:
      | Accept-Language | nl               |
      | Content-Type    | application/json |
    And receive status 200

  @short
  Scenario: Testing Posts
    When POST "{base}/pets"
    And send:
      """
      { "name" : "Ka", "type" : "Snake" }
      """
    Then receive status 201

  @short
  Scenario: Testing urlencoded bodies
    When POST "{base}/pets/form"
    And send "form":
      | name | Otis       |
      | type | Chimpanzee |
    Then receive status 201

  @short
  Scenario: Testing Posts using json file
    When POST "{base}/pets"
    And send from file: "./test/files/json/sample-json.json"
    Then receive status 201

  @short
  Scenario: Testing openapi spec intergration
    When POST "{base}/pets"
    And qs:
      | useSpec | true |
    And send example body

  @short
  Scenario: Reuse previous values
    When PUT "{base}/pets/{id}"
    And send:
      """
      { "id" : "{id}" }
      """
    And qs:
      | id | {id} |
    And I set the placeholder "id" using the json path "$.[0].id" from the last "GET" to "{base}/pets"
    Then receive status 200
    And json path at "$.name" should equal "Felix"

  @short
  Scenario: Can Test status code 4**
    When PUT "{base}/pets/5000"
    Then receive status 418
    And json path at "$.message" should equal "'5000' == '1000'"

  @short
  @oauth
  Scenario: Testing OAuth support
    Given get token from "{base}/auth/token" using:
      | client_id | 123    |
      | username  | jayani |
    When GET "{base}/secret/jayani"
    Then receive status 201

    Given get token from "{base}/auth/token" using:
      | client_id | 123    |
      | username  | gerald |
    When GET "{base}/secret/gerald"
    Then receive status 201
    Then print the response body
# Copyright 2019 Harver B.V.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

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
      | sort     | desc        |
      | filter   | {color}     |
      | time     | {timestamp} |
      | select[] | name        |
      | select[] | age         |
    And I set the cookie:
      | Name | Value | Flags  |
      | foo  | bar   | path=/ |
    And I set the request headers:
      | Accept-Language | {lang}           |
      | Content-Type    | application/json |
    Then I should receive a response with the status 200
    And I should receive a response within 1000ms
    And I should receive the text:
      """
      [{"id":"1000","type":"cat","name":"Felix","age":10},{"id":"2000","type":"dog","name":"Rover","age":3}]
      """
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
    And the response body json path at "$.[0].age" should equal "10"
    And the response body json path at "$.[0].age" should match "\d{2}"
    And the response header "Content-Language" should equal "en"

  @long
  Scenario: Testing Alternative Table Syntax for multiples
    When I send a 'GET' request to '{base}/pets'
    And I add the query string parameters:
      | sort     | desc        |
      | filter   | red         |
      | time     | {timestamp} |
      | select[] | name        |
      | select[] | age         |
    And I set the cookies:
      | Name | Value | Flags  |
      | foo  | bar   | path=/ |
    And I set the request headers:
      | Accept-Language | nl               |
      | Content-Type    | application/json |
    And I should receive a response with the status 200
    # LATENCY_BUFFER will ensure this passes
    And I should receive a response within 1ms

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
    And the response body json path at "$" should be empty

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

  @long
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

  @long
  @basicauth
  Scenario: Testing basic authentication
    Given I am using basic authentication with the credentials:
      | username | priamo |
      | password | glutes |
    When I send a 'GET' request to '{base}/basic/auth/test'
    Then I should receive a response with the status 200

  @long
  @basicauth
  Scenario: Testing basic authentication
    Given I am using basic authentication using credentials from: "./test/env/dev.json"
    When I send a 'GET' request to '{base}/basic/auth/test'
    Then I should receive a response with the status 200

  @long
  Scenario: Testing get all pets graphql query
    When I send the GraphQL query:
      """
      {
      pets {
      id
      name
      type
      }
      }
      """
    Then receive status 200

  @long
  Scenario: Testing get single pet graphql query
    When I send the GraphQL query:
      """
      {
      pet (id:"1000") {
      name
      id
      }
      }
      """
    Then receive status 200
    And json path at "$.data.pet.id" should equal "1000"

  @long
  Scenario: Testing add a new pet graphql mutation query
    When I send the GraphQL query:
      """
      mutation {
      addPet (id:"3000", name:"bird", type:"Canary") {
      id
      }
      }
      """
    Then receive status 200
    And json path at "$.data.addPet.id" should equal "3000"

@long
  Scenario Outline: Testing errors
    When GET "{base}/error/<status>"
    Then receive status <status>
    And I should receive the text:
      """
      {"message":"This is a <status> status"}
      """
    Examples:
    | status |
    | 404 |
    | 500 |


@long
  Scenario Outline: Testing redirects
    When GET "{base}/redirect/<status>"
    Then I should receive a response with the status <status>

    Examples:
    | status |
    | 301 |
    | 302 |
    | 303 |
    | 307 |
    | 308 |
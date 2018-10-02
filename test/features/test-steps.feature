Feature: API Testing Steps
  As a client
  I want to test an API

  Background: Anonymous usage
    Given I am anonymous

  Scenario: Testing Gets
    When I send a 'GET' request to '/pets'
    And I add the query string parameters
        | sort   | desc |
        | filter | red  |
    Then I should receive a response within 1000ms
    And I should receive a response with the status 200
    And the response body json path at "$.[1].name" should equal "Rover"

  Scenario: Testing Posts
    When I send a 'POST' request to '/pets'
    And I add the request body:
        """
        { "name" : "Ka", "type" : "Snake" }
        """
    Then I should receive a response with the status 201


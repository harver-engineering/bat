Feature: Custom steps and maintaining cookie sessions
  As an author of this library
  I want to test that all the steps work against a mock server
  So I can sleep at night

  Scenario: First admin login
    Given I am logged in as a "admin"
    When GET "{base}/session/secret"
    Then receive status 200
    And json path at "$.secret" should equal "pipistrelle"

  Scenario: First user login
    Given I am logged in as a "user"
    When GET "{base}/session/secret"
    Then receive status 200
    And json path at "$.secret" should equal "barbastelle"

  Scenario: Second admin login (server will maintain session and secret)
    Given I am logged in as a "admin"
    When GET "{base}/session/secret"
    Then receive status 200
    And json path at "$.secret" should equal "pipistrelle"

  Scenario: Second user login (server will maintain session and secret)
    Given I am logged in as a "user"
    When GET "{base}/session/secret"
    Then receive status 200
    And json path at "$.secret" should equal "barbastelle"
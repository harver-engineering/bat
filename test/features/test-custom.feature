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
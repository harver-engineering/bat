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

Feature: Hacker News

    Demomnstrates using values from a scenario's response in the next scenario's request

    Background:
        Given I set the variable:
            | base | https://hacker-news.firebaseio.com/v0 |
        And I am anonymous

    @hn
    Scenario: One
        When GET "{base}/topstories.json"
        Then I should receive a response with the status 200

    @hn
    Scenario: Two
        And GET "{base}/item/{storyId}.json"
        And I set the placeholder 'storyId' using the json path '$.[0]' from the last 'GET' to '{base}/topstories.json'
        Then receive status 200

    @hn
    Scenario: Three
        And GET "{base}/user/{userId}.json"
        And I set the placeholder 'userId' using the json path '$.by' from the last 'GET' to '{base}/item/{storyId}.json'
        Then receive status 200

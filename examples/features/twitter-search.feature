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

Feature: Twitter Standard search API

    Returns a collection of relevant Tweets matching a specified query.

    Background: Set up common auth
        Given I am a "twitter client"
        And I am using basic authentication using credentials from: "./examples/auth.json"
        And get token from "https://api.twitter.com/oauth2/token" using:
            | grant_type | client_credentials |

    Scenario: Search for tweets containing "Trump"
        When I send a 'GET' request to 'https://api.twitter.com/1.1/search/tweets.json'
        And I add the query string parameters:
            | q | Trump |
        Then I should receive a response with the status 200

    Scenario: Search for Tweets containing "Boris"
        When I send a 'GET' request to 'https://api.twitter.com/1.1/search/tweets.json'
        And I add the query string parameters:
            | q | Boris |
        Then I should receive a response with the status 200

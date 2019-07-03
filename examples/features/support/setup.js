// Copyright 2019 Harver B.V.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const { setWorldConstructor, After, AfterAll, Before, BeforeAll, Given, When, Then } = require('cucumber');
const { registerHooks, World: BaseWorld, registerSteps } = require('../../../src/index');

class World extends BaseWorld {
    constructor() {
        super();
    }
}

setWorldConstructor(World);
registerHooks({ After, AfterAll, Before, BeforeAll });
registerSteps({ Given, Then, When });
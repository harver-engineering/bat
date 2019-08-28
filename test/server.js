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

const express = require('express');
const session = require('express-session')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const auth = require('basic-auth');
const { equal, deepEqual, AssertionError } = require('assert');
const graphqlHTTP = require('express-graphql');
const schema = require('./graphql/schemas');

const app = express();

app.use(session({
    secret: 'keyboard bat',
    resave: true,
    saveUninitialized: false,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

const pets = [{
    id: '1000',
    type: 'cat',
    name: 'Felix',
    age: 10,
}, {
    id: '2000',
    type: 'dog',
    name: 'Rover',
    age: 3,
}];

app.get('/pets', (req, res, next) => {
    try {
        equal(req.get('accept-language'), 'nl');
        equal(req.get('content-type'), 'application/json');

        deepEqual(req.cookies, { foo: 'bar', path: '/' });
        equal(req.query.sort, 'desc');
        equal(req.query.filter, 'red');
        equal(isNaN(parseInt(req.query.time)), false);

        // force a tiny bit of latency to test the LATENCY_BUFFER config
        setTimeout(() => {
            res.set('Content-Language', 'en');
            res.json(pets);
        }, 5);
    } catch (err) {
        next(err);
    }
});

app.post('/pets', (req, res, next) => {
    try {
        const expectedRequestBody = req.query.useSpec ?
            { "type": 'Racoon', "name": 'Ronny' } :
            { "type": "Snake", "name": "Ka" };

        deepEqual(req.body, expectedRequestBody)

        res.status(201);
        res.json({ created: true });
    } catch (err) {
        next(err);
    }
});

app.post('/pets/form', (req, res, next) => {
    try {
        const expectedRequestBody = { name: 'Otis', type: 'Chimpanzee' };
        deepEqual(req.body, expectedRequestBody);

        res.status(201);
        res.send();
    } catch (err) {
        next(err);
    }
});

app.put('/pets/:id', (req, res, next) => {
    try {
        const expectedId = '1000';
        equal(req.params.id, expectedId);
        equal(req.body.id, expectedId);
        equal(req.query.id, expectedId);

        const pet = pets.filter(pet => pet.id === expectedId)[0];
        if (pet) {
            res.json(pet);
        } else {
            const err = new Error(`Pet not found with id: ${petId}`);
            err.status = 404;
            res.json({ msg: err.message });
        }
    } catch (err) {
        next(err);
    }
});

const tokens = {
    'jayani': 't1',
    'hasini': 't2',
    'gerald': 't3',
}

let geraldAuthRequestCount = 0;

app.post('/auth/token', function (req, res, next) {
    // specific test to ensure bearer token requests aren't repeated for the same user
    if (req.body.username && req.body.username === 'gerald' && ++geraldAuthRequestCount > 1) {
        next(new Error('Too many token requests from Gerald'));
    }

    if (tokens[req.body.username]) {
        return res.json({
            accessToken: tokens[req.body.username],
        })
    } else {
        res.status(401);
        res.json({
            msg: 'Access denied',
        })
    }
});

app.get('/secret/:username', function (req, res, next) {
    try {
        equal(`Bearer ${tokens[req.params.username]}`, req.get('Authorization'));
        res.status(201);
        res.send({
            foo: 'bar',
        });
    } catch (err) {
        next(err)
    }
});

app.post('/my-login', (req, res, next) => {
    const userToRole = {
        phil: 'admin',
        gerald: 'user',
    };
    if (!req.session.loggedIn) {
        // first login will set role
        req.session.role = userToRole[req.body.username] || 'guest';
    }
    req.session.loggedIn = true;
    res.status(204);
    res.send();
});

app.get('/session/secret', function (req, res, next) {
    const sessionSecrets = {
        'admin': 'pipistrelle',
        'user': 'barbastelle',
    }
    res.status(200);
    res.send({
        secret: sessionSecrets[req.session.role] || 'none',
    })
});

app.get('/basic/auth/test', function (req, res, next) {
    try {
        const { name, pass } = auth.parse(req.get('Authorization'));
        equal(name, 'priamo');
        equal(pass, 'glutes');
        res.status(200);
        res.send();
    } catch (err) {
        next(err);
    }
});

// reset values after a test suite run
app.get('/reset', function (req, res) {
    geraldAuthRequestCount = 0;
    res.status(204);
    res.send();
});

app.get('/redirect/:code', function (req, res, next) {
    const { code } = req.params;
    console.log(`Sending redirect: ${code}`)

    res.redirect(parseInt(code, 10), `/redirect/${code}/redirected`);
});

app.get('/error/:code', function (req, res, next) {
    const { code } = req.params;
    const err = new Error(`This is a ${code} status`);
    err.status = code;
    next(err);
});

app.use((err, req, res, next) => {
    console.warn(`Assertion error: ${err.message}`);
    res.status(err instanceof AssertionError ? 418 : (err.status || 500));
    res.send({ message: err.message });
});

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true,
}));

const port = 3000;
app.listen(port, () => {
    console.log(`BDD API Tester mock server now running on port ${port}`);
}).on('error', err => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Cannot start server. Something is already running on port ${port}`);
        process.exit(1);
    } else {
        console.error({ err }, 'Cannot start server. :(');
    }
});

const express = require('express');
const session = require('express-session')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { equal, deepEqual, AssertionError } = require('assert');

const app = express();

app.use(session({
    secret: 'keyboard bat',
    saveUninitialized: false,
}));;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

const pets = [{
    id: '1000',
    type: 'cat',
    name: 'Felix',
}, {
    id: '2000',
    type: 'dog',
    name: 'Rover',
}];

app.get('/pets', (req, res, next) => {
    try {
        equal(req.header['accept-language', 'nl']);
        equal(req.header['content-type', 'application/json']);

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

app.post('/auth/token', function (req, res) {
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
    if(!req.session.loggedIn) {
        // first login will set role
        req.session.role = userToRole[req.body.username] || 'guest';
    }
    req.session.loggedIn = true;
    res.status(204);
    res.send();
});

app.get('/session/secret', function (req, res, next) {
    const sessionSecrets = {
        'admin' : 'pipistrelle',
        'user' : 'barbastelle',
    }
    res.status(200);
    res.send({
        secret: sessionSecrets[req.session.role] || 'none',
    })
});



app.use((err, req, res, next) => {
    console.warn(`Assertion error: ${err.message}`);
    res.status(err instanceof AssertionError ? 418 : (err.status || 500));
    res.send({ message: err.message });
})

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

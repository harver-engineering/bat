const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { equal, deepEqual, AssertionError } = require('assert');

const app = express();
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

        res.json(pets);
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
            next(err);
        }
    } catch (err) {
        next(err);
    }
});

app.use((err, req, res, next) => {
    console.warn(err.message);
    res.status(err instanceof AssertionError ? 418 : (err.status || 500));
    res.send(err.message);
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
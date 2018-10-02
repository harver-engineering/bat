const express = require('express');
const bodyParser = require('body-parser');
const { equal, deepEqual, AssertionError } = require('assert');

const app = express();
app.use(bodyParser.json());

const pets = [{
    type: 'cat',
    name: 'Felix',
}, {
    type: 'dog',
    name: 'Rover',
}];

app.get('/pets', function(req, res, next) {
    try {
        equal(req.query.sort, 'desc');
        equal(req.query.filter, 'red');

        res.json(pets);
    } catch(err) {
        next(err);
    }
});

app.post('/pets', function(req, res, next) {
    try {
        deepEqual(req.body, { "name" : "Ka", "type" : "Snake" })

        res.status(201);
        res.json({ created: true});
    } catch(err) {
        next(err);
    }
});

app.use(function (err, req, res, next) {
    console.warn(err.message);
    res.status(err instanceof AssertionError ? 418 : 500);
    res.send(err.message);
})

app.listen(3000);
console.log('Express started on port 3000');
const express = require('express')
const app = express()
const request = require('request')
const bodyParser = require('body-parser')

const {validate_req} = require('./request_validator/schema_validator')

app.use(bodyParser());

app.post('/ping',validate_req(request,1), (req, res) => {
    return res.status(200).send({ "pong": "success" })
});

var server = require('http').createServer(app);

server.listen(process.env.PORT || 8080);
console.log('server running...at 8080');

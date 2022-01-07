const express = require("express");
const http = require("http");
const ejs = require("ejs");
const app = express();

app.get("/health-check", (req, res) => {
    res.status(200).send({
        code: 200,
        message: "Successful health check!"
    });
});

app.get("/", (req, res) => {
    ejs.renderFile(
        "./build/index.html",
        {
            token: "MY_AUTH_TOKEN"
        }, {
            delimiter: "$",
            openDelimiter: "[",
            closeDelimiter: "]"
        }, (err, str) => {
            res.status(200).send(str);
        }
    )
});

app.use(express.static("build"));

const server = http.createServer(app);
server.listen(3000);

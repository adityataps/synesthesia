"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var dotenv = require("dotenv");
var morgan_1 = require("morgan");
dotenv.config();
var app = (0, express_1.default)();
app.use((0, morgan_1.default)("dev"));
app.get("/", function (req, res) {
    res.send("hello, world!");
});
var port = parseInt((_a = process.env.EXPRESS_PORT) !== null && _a !== void 0 ? _a : "3000");
app.listen(port, function () {
    console.log("Listening on port ".concat(port));
});

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const databaseService_1 = require("./src/services/databaseService");
const routes_1 = __importDefault(require("./src/routes"));
const app = (0, express_1.default)();
const port = parseInt((_a = process.env.EXPRESS_PORT) !== null && _a !== void 0 ? _a : "") || "3000";
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
app.use(routes_1.default);
(0, databaseService_1.connect)().then(() => {
    app.listen(port, () => {
        console.log(`Express server listening on port ${port}.`);
    });
});

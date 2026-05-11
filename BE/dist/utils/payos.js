"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("@payos/node");
require("dotenv/config");
const payOS = new node_1.PayOS({
    clientId: process.env.PAYOS_CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});
exports.default = payOS;

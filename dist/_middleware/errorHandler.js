"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, req, res, next) {
    if (typeof err === 'string') {
        return res.status(400).json({ message: err });
    }
    if (err.name === 'ValidationError') {
        return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: err.message });
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const joi_1 = __importDefault(require("joi"));
const validateRequest_1 = require("../_middleware/validateRequest");
const user_service_1 = require("./user.service");
const router = express_1.default.Router();
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', createSchema, create);
router.put('/:id', updateSchema, update);
router.delete('/:id', _delete);
router.post('/authenticate', authenticate);
exports.default = router;
// Routes
async function getAll(req, res, next) {
    try {
        res.json(await user_service_1.userService.getAll());
    }
    catch (err) {
        next(err);
    }
}
async function getById(req, res, next) {
    try {
        res.json(await user_service_1.userService.getById(Number(req.params.id)));
    }
    catch (err) {
        next(err);
    }
}
function authenticate(req, res, next) {
    user_service_1.userService.authenticate(req.body)
        .then(user => res.json(user))
        .catch(next);
}
function createSchema(req, res, next) {
    const schema = joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(6).required(),
        title: joi_1.default.string().required(),
        firstName: joi_1.default.string().required(),
        lastName: joi_1.default.string().required(),
        role: joi_1.default.string().valid('Admin', 'User')
    });
    (0, validateRequest_1.validateRequest)(req, next, schema);
}
async function create(req, res, next) {
    try {
        await user_service_1.userService.create(req.body);
        res.json({ message: 'User created successfully' });
    }
    catch (err) {
        next(err);
    }
}
function updateSchema(req, res, next) {
    const schema = joi_1.default.object({
        email: joi_1.default.string().email().empty(''),
        password: joi_1.default.string().min(6).empty(''),
        title: joi_1.default.string().empty(''),
        firstName: joi_1.default.string().empty(''),
        lastName: joi_1.default.string().empty(''),
        role: joi_1.default.string().valid('Admin', 'User').empty('')
    });
    (0, validateRequest_1.validateRequest)(req, next, schema);
}
async function update(req, res, next) {
    try {
        await user_service_1.userService.update(Number(req.params.id), req.body);
        res.json({ message: 'User updated successfully' });
    }
    catch (err) {
        next(err);
    }
}
async function _delete(req, res, next) {
    try {
        await user_service_1.userService.delete(Number(req.params.id));
        res.json({ message: 'User deleted successfully' });
    }
    catch (err) {
        next(err);
    }
}

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const joi_1 = __importDefault(require("joi"));
const validateRequest_1 = require("../_middleware/validateRequest");
const department_service_1 = require("./department.service");
const router = express_1.default.Router();
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', createSchema, create);
router.put('/:id', updateSchema, update);
router.delete('/:id', _delete);
exports.default = router;
// ROUTES
async function getAll(req, res, next) {
    try {
        res.json(await department_service_1.departmentService.getAll());
    }
    catch (err) {
        next(err);
    }
}
async function getById(req, res, next) {
    try {
        res.json(await department_service_1.departmentService.getById(Number(req.params.id)));
    }
    catch (err) {
        next(err);
    }
}
function createSchema(req, res, next) {
    const schema = joi_1.default.object({
        name: joi_1.default.string().required(),
        description: joi_1.default.string().required()
    });
    (0, validateRequest_1.validateRequest)(req, next, schema);
}
async function create(req, res, next) {
    try {
        await department_service_1.departmentService.create(req.body);
        res.json({ message: 'Department created successfully' });
    }
    catch (err) {
        next(err);
    }
}
function updateSchema(req, res, next) {
    const schema = joi_1.default.object({
        name: joi_1.default.string().empty(''),
        description: joi_1.default.string().empty('')
    });
    (0, validateRequest_1.validateRequest)(req, next, schema);
}
async function update(req, res, next) {
    try {
        await department_service_1.departmentService.update(Number(req.params.id), req.body);
        res.json({ message: 'Department updated successfully' });
    }
    catch (err) {
        next(err);
    }
}
async function _delete(req, res, next) {
    try {
        await department_service_1.departmentService.delete(Number(req.params.id));
        res.json({ message: 'Department deleted successfully' });
    }
    catch (err) {
        next(err);
    }
}

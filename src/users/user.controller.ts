import express, { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validateRequest } from '../_middleware/validateRequest';
import { userService } from './user.service';

const router = express.Router();

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', createSchema, create);
router.put('/:id', updateSchema, update);
router.delete('/:id', _delete);

export default router;

// Routes

async function getAll(req: Request, res: Response, next: NextFunction) {
    try {
        res.json(await userService.getAll());
    } catch (err) {
        next(err);
    }
}

async function getById(req: Request, res: Response, next: NextFunction) {
    try {
        res.json(await userService.getById(Number(req.params.id)));
    } catch (err) {
        next(err);
    }
}

function createSchema(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        title: Joi.string().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        role: Joi.string().valid('Admin', 'User')
    });
    validateRequest(req, next, schema);
}

async function create(req: Request, res: Response, next: NextFunction) {
    try {
        await userService.create(req.body);
        res.json({ message: 'User created successfully' });
    } catch (err) {
        next(err);
    }
}

function updateSchema(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
        email: Joi.string().email().empty(''),
        password: Joi.string().min(6).empty(''),
        title: Joi.string().empty(''),
        firstName: Joi.string().empty(''),
        lastName: Joi.string().empty(''),
        role: Joi.string().valid('Admin', 'User').empty('')
    });
    validateRequest(req, next, schema);
}

async function update(req: Request, res: Response, next: NextFunction) {
    try {
        await userService.update(Number(req.params.id), req.body);
        res.json({ message: 'User updated successfully' });
    } catch (err) {
        next(err);
    }
}

async function _delete(req: Request, res: Response, next: NextFunction) {
    try {
        await userService.delete(Number(req.params.id));
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        next(err);
    }
}
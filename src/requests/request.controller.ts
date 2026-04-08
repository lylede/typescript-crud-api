import express, { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { validateRequest } from '../_middleware/validateRequest';
import { requestService } from './request.service';

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
        res.json(await requestService.getAll());
    } catch (err) {
        next(err);
    }
}

async function getById(req: Request, res: Response, next: NextFunction) {
    try {
        res.json(await requestService.getById(Number(req.params.id)));
    } catch (err) {
        next(err);
    }
}

function createSchema(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

async function create(req: Request, res: Response, next: NextFunction) {
    try {
        await requestService.create(req.body);
        res.json({ message: 'Request created successfully' });
    } catch (err) {
        next(err);
    }
}

function updateSchema(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
        title: Joi.string().empty(''),
        description: Joi.string().empty(''),
        status: Joi.string().empty('')
    });
    validateRequest(req, next, schema);
}

async function update(req: Request, res: Response, next: NextFunction) {
    try {
        await requestService.update(Number(req.params.id), req.body);
        res.json({ message: 'Request updated successfully' });
    } catch (err) {
        next(err);
    }
}

async function _delete(req: Request, res: Response, next: NextFunction) {
    try {
        await requestService.delete(Number(req.params.id));
        res.json({ message: 'Request deleted successfully' });
    } catch (err) {
        next(err);
    }
}
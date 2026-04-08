import { Router, Request, Response, NextFunction } from "express";
import Joi from "joi";
import { validateRequest } from "../_middleware/validateRequest";
import { departmentService } from "../departments/department.service";

const router = Router();

// GET ALL
router.get("/", async (req, res, next) => {
    try {
        const data = await departmentService.getAll();
        res.json(data);
    } catch (err) {
        next(err);
    }
});

// GET BY ID
router.get("/:id", async (req, res, next) => {
    try {
        const data = await departmentService.getById(Number(req.params.id));
        res.json(data);
    } catch (err) {
        next(err);
    }
});

// CREATE
router.post(
    "/",
    createSchema,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await departmentService.create(req.body);
            res.json({ message: "Department created" });
        } catch (err) {
            next(err);
        }
    }
);

// UPDATE
router.put(
    "/:id",
    updateSchema,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await departmentService.update(Number(req.params.id), req.body);
            res.json({ message: "Department updated" });
        } catch (err) {
            next(err);
        }
    }
);

// DELETE
router.delete("/:id", async (req, res, next) => {
    try {
        await departmentService.delete(Number(req.params.id));
        res.json({ message: "Department deleted" });
    } catch (err) {
        next(err);
    }
});

export default router;

// ✅ VALIDATION
function createSchema(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
    });

    validateRequest(req, next, schema);
}

function updateSchema(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
        name: Joi.string().empty(""),
        description: Joi.string().empty(""),
    });

    validateRequest(req, next, schema);
}
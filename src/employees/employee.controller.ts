import { Router, Request, Response, NextFunction } from "express";
import Joi from "joi";
import { validateRequest } from "../_middleware/validateRequest";
import { employeeService } from "./employee.service";

const router = Router();

// GET ALL
router.get("/", async (req, res, next) => {
    try {
        const data = await employeeService.getAll();
        res.json(data);
    } catch (err) {
        next(err);
    }
});

// GET BY ID
router.get("/:id", async (req, res, next) => {
    try {
        const data = await employeeService.getById(Number(req.params.id));
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
            await employeeService.create(req.body);
            res.json({ message: "Employee created" });
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
            await employeeService.update(Number(req.params.id), req.body);
            res.json({ message: "Employee updated" });
        } catch (err) {
            next(err);
        }
    }
);

// DELETE
router.delete("/:id", async (req, res, next) => {
    try {
        await employeeService.delete(Number(req.params.id));
        res.json({ message: "Employee deleted" });
    } catch (err) {
        next(err);
    }
});

export default router;
// VALIDATION
function createSchema(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
        employeeId: Joi.string().required(),
        email: Joi.string().required(),
        position: Joi.string().required(),
        departmentId: Joi.number().required(),
        hireDate: Joi.date().required(),
    });

    validateRequest(req, next, schema);
}

function updateSchema(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
        employeeId: Joi.string().empty(""),
        email: Joi.string().empty(""),
        position: Joi.string().empty(""),
        departmentId: Joi.number().empty(""),
        hireDate: Joi.date().empty(""),
    });

    validateRequest(req, next, schema);
}
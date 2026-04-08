import { db } from "../_helpers/db";

export const employeeService = {
    getAll,
    getById,
    create,
    update,
    delete: _delete,
};

async function getAll() {
    return await db.Employee.findAll();
}

async function getById(id: number) {
    const emp = await db.Employee.findByPk(id);
    if (!emp) throw new Error("Employee not found");
    return emp;
}

async function create(params: any) {
    return await db.Employee.create(params);
}

async function update(id: number, params: any) {
    const emp = await getById(id);
    Object.assign(emp, params);
    await emp.save();
}

async function _delete(id: number) {
    const emp = await getById(id);
    await emp.destroy();
}
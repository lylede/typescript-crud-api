import { db } from "../_helpers/db";

export const departmentService = {
    getAll,
    getById,
    create,
    update,
    delete: _delete,
};

async function getAll() {
    return await db.Department.findAll();
}

async function getById(id: number) {
    const dept = await db.Department.findByPk(id);
    if (!dept) throw new Error("Department not found");
    return dept;
}

async function create(params: any) {
    return await db.Department.create(params);
}

async function update(id: number, params: any) {
    const dept = await getById(id);
    Object.assign(dept, params);
    await dept.save();
}

async function _delete(id: number) {
    const dept = await getById(id);
    await dept.destroy();
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentService = void 0;
const db_1 = require("../_helpers/db");
exports.departmentService = {
    getAll,
    getById,
    create,
    update,
    delete: _delete
};
async function getAll() {
    return await db_1.db.Department.findAll();
}
async function getById(id) {
    return await getDepartment(id);
}
async function create(params) {
    await db_1.db.Department.create(params);
}
async function update(id, params) {
    const department = await getDepartment(id);
    await department.update(params);
}
async function _delete(id) {
    const department = await getDepartment(id);
    await department.destroy();
}
async function getDepartment(id) {
    const department = await db_1.db.Department.findByPk(id);
    if (!department)
        throw new Error('Department not found');
    return department;
}

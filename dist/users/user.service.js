"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../_helpers/db");
const role_1 = require("../_helpers/role");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.userService = {
    getAll,
    getById,
    create,
    update,
    delete: _delete,
    authenticate
};
async function authenticate({ email, password }) {
    const user = await db_1.db.User.scope('withHash').findOne({ where: { email } });
    if (!user || !(await bcryptjs_1.default.compare(password, user.passwordHash))) {
        throw 'Email or password is incorrect';
    }
    const token = jsonwebtoken_1.default.sign({ sub: user.id, role: user.role }, process.env.SECRET || "secret");
    return {
        ...user.get(),
        token
    };
}
async function getAll() {
    return await db_1.db.User.findAll();
}
async function getById(id) {
    return await getUser(id);
}
async function create(params) {
    const existingUser = await db_1.db.User.findOne({ where: { email: params.email } });
    if (existingUser) {
        throw new Error(`Email "${params.email}" is already registered`);
    }
    const passwordHash = await bcryptjs_1.default.hash(params.password, 10);
    await db_1.db.User.create({
        ...params,
        passwordHash,
        role: params.role || role_1.Role.User
    });
}
async function update(id, params) {
    const user = await getUser(id);
    if (params.password) {
        params.passwordHash = await bcryptjs_1.default.hash(params.password, 10);
        delete params.password;
    }
    await user.update(params);
}
async function _delete(id) {
    const user = await getUser(id);
    await user.destroy();
}
async function getUser(id) {
    const user = await db_1.db.User.scope('withHash').findByPk(id);
    if (!user)
        throw new Error('User not found');
    return user;
}

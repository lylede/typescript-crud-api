"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initialize = initialize;
const config_json_1 = __importDefault(require("../../config.json"));
const promise_1 = __importDefault(require("mysql2/promise"));
const sequelize_1 = require("sequelize");
// MODELS
const department_model_1 = __importDefault(require("../departments/department.model"));
const user_model_1 = __importDefault(require("../users/user.model"));
exports.db = {};
async function initialize() {
    const { host, port, user, password, database } = config_json_1.default.database;
    // CREATE DATABASE IF NOT EXISTS
    const connection = await promise_1.default.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();
    // CONNECT SEQUELIZE
    const sequelize = new sequelize_1.Sequelize(database, user, password, {
        host,
        dialect: 'mysql'
    });
    // INIT MODELS
    exports.db.User = (0, user_model_1.default)(sequelize);
    exports.db.Department = (0, department_model_1.default)(sequelize);
    // 🔥 OPTIONAL (for future relations)
    // db.Department.hasMany(db.User, { foreignKey: 'departmentId' });
    // SYNC DATABASE
    await sequelize.sync({ alter: true });
    console.log("✅ Database initialized and models synced");
}

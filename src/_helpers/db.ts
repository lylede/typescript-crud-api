import config from '../../config.json';
import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';

// MODELS

import UserModel, { User } from '../users/user.model';
import DepartmentModel from "../departments/department.model";



// DATABASE INTERFACE
export interface Database {
    User: typeof User;
    Department: any;

}

export const db: Database = {} as Database;

export async function initialize(): Promise<void> {
    const { host, port, user, password, database } = config.database;

    // CREATE DATABASE IF NOT EXISTS
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();

    // CONNECT SEQUELIZE
    const sequelize = new Sequelize(database, user, password, {
        host,
        dialect: 'mysql'
    });

    // INIT MODELS
    db.User = UserModel(sequelize);
    db.Department = DepartmentModel(sequelize);


    
    // 🔥 OPTIONAL (for future relations)
    // db.Department.hasMany(db.User, { foreignKey: 'departmentId' });

    // SYNC DATABASE
    await sequelize.sync({ alter: true });

    console.log("✅ Database initialized and models synced");
}
import config from '../../config.json';
import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';

<<<<<<< HEAD
// MODELS

import UserModel, { User } from '../users/user.model';

// DATABASE INTERFACE
export interface Database {
    User: typeof User;
=======


export interface Database {
    User: any;
>>>>>>> second_repo/main
}

export const db: Database = {} as Database;

export async function initialize(): Promise<void> {
    const { host, port, user, password, database } = config.database;

<<<<<<< HEAD
    // CREATE DATABASE IF NOT EXISTS
=======
>>>>>>> second_repo/main
    const connection = await mysql.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();

<<<<<<< HEAD
    // CONNECT SEQUELIZE
    const sequelize = new Sequelize(database, user, password, {
        host,
        dialect: 'mysql'
    });

    // INIT MODELS
    db.User = UserModel(sequelize);

    // 🔥 OPTIONAL (for future relations)
    // db.Department.hasMany(db.User, { foreignKey: 'departmentId' });

    // SYNC DATABASE
    await sequelize.sync({ alter: true });

    console.log("✅ Database initialized and models synced");
=======
    const sequelize = new Sequelize(database, user, password, { dialect: 'mysql' });

    const { default: userModel } = await import ('../users/user.model');
    db.User = userModel(sequelize);

    await sequelize.sync({ alter: true });

    console.log("Database initialized and models synced");
>>>>>>> second_repo/main
}
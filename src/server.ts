import express, { Application } from 'express';
import cors from 'cors';

import { errorHandler } from './_middleware/errorHandler';
import { initialize } from './_helpers/db';
import usersController from '../src/users/user.controller';
import departmentController from './departments/department.controller';
import employeeController from './employees/employee.controller';
import requestController from './employees/employee.controller';


const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/users', usersController);
app.use('/departments', departmentController);
app.use('/employees', employeeController);
app.use('/requests', requestController);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`✅ Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Failed to initialize database:', err);
        process.exit(1);
    });
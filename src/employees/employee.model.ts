import { DataTypes, Model, Optional } from "sequelize";
import type { Sequelize } from "sequelize";

export interface EmployeeAttributes {
    id: number;
    employeeId: string;
    email: string;
    position: string;
    departmentId: number;
    hireDate: Date;
}

export interface EmployeeCreationAttributes
    extends Optional<EmployeeAttributes, "id"> {}

export class Employee
    extends Model<EmployeeAttributes, EmployeeCreationAttributes>
    implements EmployeeAttributes {

    public id!: number;
    public employeeId!: string;
    public email!: string;
    public position!: string;
    public departmentId!: number;
    public hireDate!: Date;
}

function EmployeeModel(sequelize: Sequelize): typeof Employee {
    Employee.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        employeeId: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false },
        position: { type: DataTypes.STRING, allowNull: false },
        departmentId: { type: DataTypes.INTEGER, allowNull: false },
        hireDate: { type: DataTypes.DATE, allowNull: false }
    }, {
        sequelize,
        tableName: "employees"
    });

    return Employee;
}

export default EmployeeModel; 
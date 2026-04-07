import { DataTypes, Model, Optional } from "sequelize";
import type { Sequelize } from "sequelize";

export interface DepartmentAttributes {
    id: number;
    name: string;
    description: string;
}

export interface DepartmentCreationAttributes
    extends Optional<DepartmentAttributes, "id"> {}

export class Department
    extends Model<DepartmentAttributes, DepartmentCreationAttributes>
    implements DepartmentAttributes {

    public id!: number;
    public name!: string;
    public description!: string;
}

export default function DepartmentModel(sequelize: Sequelize) {
    Department.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "Department",
            tableName: "departments",
        }
    );

    return Department;
}
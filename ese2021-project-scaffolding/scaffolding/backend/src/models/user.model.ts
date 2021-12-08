import { Optional, Model, Sequelize, DataTypes } from 'sequelize';
import { UserPostVote } from './user-post-vote.model';

export interface UserAttributes {
    userId: number;
    userName: string;
    password: string;
    userEmail: string;
    firstName: string;
    lastName: string;
    street: string;
    houseNr: string;
    city: string;
    zipCode: string;
    birthday: Date;
    phoneNr: string;
    admin: boolean;
}

export interface UserCreationAttributes extends Optional<UserAttributes, 'userId'> { }

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    userId!: number;
    userName!: string;
    password!: string;
    userEmail!: string;
    firstName!: string;
    lastName!: string;
    street!: string;
    houseNr!: string;
    city!: string;
    zipCode!: string;
    birthday!: Date;
    phoneNr!: string;
    admin!: boolean;

    public static initialize(sequelize: Sequelize) {
        User.init({
            userId: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            userName: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            },
            userEmail: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            firstName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            lastName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            street: {
                type: DataTypes.STRING,
                allowNull: false
            },
            houseNr: {
                type: DataTypes.STRING,
                allowNull: false
            },
            city: {
                type: DataTypes.STRING,
                allowNull: false
            },
            zipCode: {
                type: DataTypes.STRING,
                allowNull: false
            },
            birthday: {
                type: DataTypes.DATE,
                allowNull: false
            },
            phoneNr: {
                type: DataTypes.STRING,
                allowNull: false
            },
            admin: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        },
            {
                sequelize,
                tableName: 'users'
            }
        );
    }

    public static createAssociations() {
        User.hasMany(UserPostVote, {
            as: 'UserVote',
            foreignKey: 'userId'
        });
    }
}

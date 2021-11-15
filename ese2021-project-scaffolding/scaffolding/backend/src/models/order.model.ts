import {Optional, Model, Sequelize, DataTypes} from 'sequelize';

export interface OrderAttributes {
    status: string;
    orderId: number;
    userId: number;
    productId: number;
    adminId: number;
    shippedDate: Date;
}

export interface OrderCreationAttributes extends Optional<Order, 'orderId'> { }

export class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {

    status!: string;
    orderId!: number;
    userId!: number;
    productId!: number;
    adminId!: number;
    shippedDate!: Date;


    public static initialize(sequelize: Sequelize) { // definition for database
        Order.init({
                status: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                orderId: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                userId: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },
                productId: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },
                adminId: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },
                shippedDate: {
                    type: DataTypes.DATE,
                    allowNull: true
                }
            },
            {sequelize, tableName: 'orders'}
        );
    }
}

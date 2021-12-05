import {Optional, Model, Sequelize, DataTypes} from 'sequelize';

export interface OrderAttributes {
    status: string;
    orderId: number;
    userId: number;
    productId: number;
    adminId: number;
    shippedDate: Date;
    orderFirstName: string;
    orderLastName: string;
    orderStreet: string;
    orderHouseNr: number;
    orderZipCode: number;
    orderCity: string;
    orderPhoneNr: string;
    billingStatus: string;
    sessionId: string;
}

export interface OrderCreationAttributes extends Optional<Order, 'orderId'> { }

export class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {

    status!: string;
    orderId!: number;
    userId!: number;
    productId!: number;
    adminId!: number;
    shippedDate!: Date;
    orderFirstName!: string;
    orderLastName!: string;
    orderStreet!: string;
    orderHouseNr!: number;
    orderZipCode!: number;
    orderCity!: string;
    orderPhoneNr!: string;
    billingStatus!: string;
    sessionId!: string;


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
                },
                orderFirstName: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                orderLastName: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                orderStreet: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                orderHouseNr: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },
                orderZipCode: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },
                orderCity: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                orderPhoneNr: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                billingStatus: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                sessionId: {
                    type: DataTypes.STRING,
                    allowNull: true
                },
            },
            {sequelize, tableName: 'orders'}
        );
    }

    public async checkBillingStatus(orders: Order[]): Promise<void> {
        if (this.billingStatus === '') { // if billing status has not yet been set, check payment status of stripe session
            const path = require('path');
            require('dotenv').config({ path: path.resolve(__dirname, '../../src/.env') });

            // Stripe private key should never be published
            const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
            const session = await stripe.checkout.sessions.retrieve(this.sessionId);
            if (session.payment_status === 'unpaid') {
                Order.findByPk(this.orderId)
                    .then((toDelete) => toDelete.destroy()); // delete stripe orders that have not been paid
            } else {
                this.billingStatus = 'paid with stripe';
                const updatedOrder = this.toJSON();
                Order.findByPk(this.orderId).then(found => found.update(updatedOrder));
            }
        } else {
            orders.push(this);
        }
    }
}

import {Optional, Model, Sequelize, DataTypes} from 'sequelize';

export interface ProductAttributes {
    productId: number;
    title: string;
    description: Text;
    tags: string;
    price: number;
}

export interface ProductCreationAttributes extends Optional<Product, 'productId'> { }


export class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {

    productId!: number;
    title!: string;
    userId!: number;
    description!: Text;
    tags!: string;
    price!: number;


    public static initialize(sequelize: Sequelize) {
        Product.init({
                productId: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                title: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                description: {
                    type: DataTypes.TEXT,
                    allowNull: true
                },
                tags: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                price: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                }
            },
            { sequelize, tableName: 'products' }
        );

    }
}

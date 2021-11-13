import {Optional, Model, Sequelize, DataTypes, Association, HasManyGetAssociationsMixin, HasManyAddAssociationMixin} from 'sequelize';

export interface ProductAttributes {
    productId: number;
    title: string;
    description: Text;
    imageId: number;
    tags: string; // contains the categories as comma-seperated-values. E.g. "Restaurant,Activities"
    price: number;
}


// tells sequelize that productId is not a required field
export interface ProductCreationAttributes extends Optional<Product, 'productId'> { }


export class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {

    // public static associations: {
    //     images: Association<TodoItem, ItemImage>
    // };

    productId!: number;
    title!: string;
    userId!: number;
    description!: Text;
    imageId!: number;
    tags!: string;
    price!: number;


    public static initialize(sequelize: Sequelize) { // definition for database
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
                imageId: {
                    type: DataTypes.INTEGER,
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

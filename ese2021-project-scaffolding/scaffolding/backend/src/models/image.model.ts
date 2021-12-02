import { Optional, Model, DataTypes, Sequelize, Association } from 'sequelize';

export interface ImageAttributes {
    imageId: number;
    file: Blob;
    postId: number;
    productId: number;
}

export interface ImageCreationAttributes extends Optional<ImageAttributes, 'imageId'> { }

export class Image extends Model<ImageAttributes, ImageCreationAttributes> implements ImageAttributes {
    // public static associations: {
    //     product: Association<TodoItem, Image>;
    // };

    imageId!: number;
    file!: Blob;
    postId!: number;
    productId!: number;

    public static initialize(sequelize: Sequelize) {
        Image.init(
            {
                imageId: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                file: {
                    type: DataTypes.BLOB,
                    allowNull: false
                },
                postId: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },
                productId: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                }
            },
            { tableName: 'images', sequelize }
        );
    }
}

import { Optional, Model, DataTypes, Sequelize, Association } from 'sequelize';
import {TodoItem} from './todoitem.model';

export interface ItemImageAttributes {
    imageId: number;
    fileName: string;
    todoItemId: number;
}

export interface ItemCreationAttributes extends Optional<ItemImageAttributes, 'imageId'> { }

export class ItemImage extends Model<ItemImageAttributes, ItemCreationAttributes> implements ItemImageAttributes {
    public static associations: {
        product: Association<TodoItem, ItemImage>;
    };

    imageId!: number;
    fileName!: string;
    todoItemId!: number;

    public static initialize(sequelize: Sequelize) {
        ItemImage.init(
            {
                imageId: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                fileName: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                todoItemId: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                }
            },
            { tableName: 'itemImages', sequelize }
        );
    }

    public static createAssociations() {
        ItemImage.belongsTo(TodoItem, {
            targetKey: 'todoItemId',
            as: 'item',
            onDelete: 'cascade',
            foreignKey: 'todoItemId'
        });
    }
}

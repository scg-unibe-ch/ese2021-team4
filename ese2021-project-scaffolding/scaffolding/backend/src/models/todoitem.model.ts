import {Optional, Model, Sequelize, DataTypes, Association} from 'sequelize';
import { TodoList } from './todolist.model';
import {ItemImage} from './itemImage.model';

export interface TodoItemAttributes {
    todoItemId: number;
    name: string;
    done: boolean;
    todoListId: number;
    itemImage: string;
}

// tells sequelize that todoItemId is not a required field
export interface TodoItemCreationAttributes extends Optional<TodoItem, 'todoItemId'> { }


export class TodoItem extends Model<TodoItemAttributes, TodoItemCreationAttributes> implements TodoItemAttributes {

    public static associations: {
        images: Association<TodoItem, ItemImage>
    };

    todoItemId!: number;
    name!: string;
    done!: boolean;
    todoListId!: number;
    itemImage!: string;


    public static initialize(sequelize: Sequelize) { // definition for database
        TodoItem.init({
            todoItemId: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            done: {
                type: DataTypes.BOOLEAN,
                allowNull: false
            },
            itemImage: {
                type: DataTypes.BOOLEAN,
                allowNull: true
            },
            todoListId: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        },
        { sequelize, tableName: 'todoItems' }
        );

    }
    public static createAssociations() {
        TodoItem.belongsTo(TodoList, {
            targetKey: 'todoListId',
            as: 'todoList',
            onDelete: 'cascade',
            foreignKey: 'todoListId'
        });
        TodoItem.hasMany(ItemImage, {
            as: 'images',
            foreignKey: 'todoItemId'
        });
    }

}

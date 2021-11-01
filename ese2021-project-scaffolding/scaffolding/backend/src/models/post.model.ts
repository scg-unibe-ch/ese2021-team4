import {Optional, Model, Sequelize, DataTypes, Association} from 'sequelize';

export interface PostAttributes {
    postId: number;
    title: string;
    userId: number;
    description: Text;
    imageId: number;
    tags: string; // contains the categories as comma-seperated-values. E.g. "Restaurant,Activities"
    upvotes: number;
    downvotes: number;
}


// tells sequelize that postId is not a required field
export interface PostCreationAttributes extends Optional<Post, 'postId'> { }


export class Post extends Model<PostAttributes, PostCreationAttributes> implements PostAttributes {

    // public static associations: {
    //     images: Association<TodoItem, ItemImage>
    // };

    postId!: number;
    title!: string;
    userId!: number;
    description!: Text;
    imageId!: number;
    tags!: string;
    upvotes!: number;
    downvotes!: number;


    public static initialize(sequelize: Sequelize) { // definition for database
        Post.init({
            postId: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false
            },
            userId: {
                type: DataTypes.INTEGER,
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

            upvotes: {
                type: DataTypes.INTEGER,
                allowNull: false
            },


            downvotes: {
                type: DataTypes.INTEGER,
                allowNull: false
                }
        },
        { sequelize, tableName: 'posts' }
        );

    }

    // public static createAssociations() {
    //     Post.belongsTo(PostFeed, {
    //         targetKey: 'PostFeedId',
    //         as: 'todoList',
    //         onDelete: 'cascade',
    //         foreignKey: 'todoListId'
    //     });
    //     TodoItem.hasMany(ItemImage, {
    //         as: 'images',
    //         foreignKey: 'todoItemId'
    //     });
    // }

}

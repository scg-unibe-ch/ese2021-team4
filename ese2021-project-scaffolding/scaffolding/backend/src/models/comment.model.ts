import {Optional, Model, Sequelize, DataTypes, Association, HasManyGetAssociationsMixin, HasManyAddAssociationMixin} from 'sequelize';
import { Post, PostCreationAttributes } from './post.model';

export interface CommentAttributes {
    commentId: number;
    postId: number;
    userId: number;
    description: string;
    upvotes: number;
    downvotes: number;
}


// tells sequelize that postId is not a required field
export interface CommentCreationAttributes extends Optional<Comment, 'commentId'> { }


export class Comment extends Model<CommentAttributes, CommentCreationAttributes> implements CommentAttributes {

    commentId!: number;
    postId!: number;
    userId!: number;
    description!: string;
    upvotes!: number;
    downvotes!: number;

    public static initialize(sequelize: Sequelize) { // definition for database
        Comment.init({
                commentId: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                postId: {
                    type: DataTypes.INTEGER,
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
                upvotes: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                },
                downvotes: {
                    type: DataTypes.INTEGER,
                    allowNull: false
                }
            },
            {sequelize, tableName: 'comments'}
        );

    }

    public static createAssociations() {
            Comment.belongsTo(Post, {
                targetKey: 'postId',
                as: 'post',
                onDelete: 'cascade',
                foreignKey: 'postId'
            });
    }

}

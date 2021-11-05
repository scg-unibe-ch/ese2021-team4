import {Optional, Model, Sequelize, DataTypes, Association} from 'sequelize';
import { Post } from './post.model';
import { User } from './user.model';

export interface UserPostVoteAttributes {
    postId: number;
    userId: number;
    vote: number;
}


// tells sequelize that postId is not a required field
export interface UserPostVoteCreationAttributes extends Optional<UserPostVote, 'postId'> { }


export class UserPostVote extends Model<UserPostVoteAttributes, UserPostVoteCreationAttributes> implements UserPostVoteAttributes {

    // public static associations: {
    //     images: Association<TodoItem, ItemImage>
    // };

    postId!: number;
    userId!: number;
    vote!: number;


    public static initialize(sequelize: Sequelize) { // definition for database
        UserPostVote.init({
            postId: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            userId: {
                type: DataTypes.INTEGER,
                primaryKey: true,
            },
            vote: {
                type: DataTypes.INTEGER,
                allowNull: false
                }
        },
        { sequelize, tableName: 'UserPostVote' }
        );

    }

    public static createAssociations() {
        UserPostVote.belongsTo(User, {
            targetKey: 'userId',
            as: 'UserVote',
            onDelete: 'cascade',
            foreignKey: 'userId'
        });
        UserPostVote.belongsTo(Post, {
            targetKey: 'postId',
            as: 'PostVote',
            onDelete: 'cascade',
            foreignKey: 'postId'
        });

    }

}

import {Optional, Model, Sequelize, DataTypes} from 'sequelize';
import { Post } from './post.model';
import { User } from './user.model';

export interface UserPostVoteAttributes {
    postId: number;
    userId: number;
    vote: number;
    flag: number;
}

export interface UserPostVoteCreationAttributes extends Optional<UserPostVote, 'postId'> { }


export class UserPostVote extends Model<UserPostVoteAttributes, UserPostVoteCreationAttributes> implements UserPostVoteAttributes {

    postId!: number;
    userId!: number;
    vote!: number;
    flag!: number;


    public static initialize(sequelize: Sequelize) {
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
                allowNull: true
                },
            flag: {
                type: DataTypes.INTEGER,
                allowNull: true
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

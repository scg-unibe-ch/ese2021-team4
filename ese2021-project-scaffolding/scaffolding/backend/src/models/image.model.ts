import {Optional, Model, Sequelize, DataTypes, Association, HasManyGetAssociationsMixin, HasManyAddAssociationMixin} from 'sequelize';

export interface ImageAttributes {
    postId: number;
    imageId: number;
    image: Blob;
}


// tells sequelize that postId is not a required field
export interface ImageCreationAttributes extends Optional<Image, 'postId'> { }


export class Image extends Model<ImageAttributes, ImageCreationAttributes> implements ImageAttributes {


    postId!: number;
    imageId!: number;
    image!: Blob;

    // public getComments!: HasManyGetAssociationsMixin<Comment>;
    // public addComment!: HasManyAddAssociationMixin<Comment, number>;

    // public readonly Comments?: Comment[];


    public static initialize(sequelize: Sequelize) { // definition for database
        Image.init({
            postId: {
                type: DataTypes.INTEGER,
                // autoIncrement: true,
                // primaryKey: true
            },
            imageId: {
                type: DataTypes.INTEGER,
                primaryKey: true
            },
            image: {
                type: DataTypes.BLOB
            }
        },
        { sequelize, tableName: 'images' }
        );

    }

    // public static createAssociations() {
    //     Post.hasMany(Comment, {
    //         as: 'Comments',
    //         foreignKey: 'postId'
    //     });
    //     Post.hasMany(UserPostVote, {
    //         as: 'PostVote',
    //         foreignKey: 'postId'
    //     });
    // }

}

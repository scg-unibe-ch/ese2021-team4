import { Optional, Model, DataTypes, Sequelize, Association } from 'sequelize';
import {TodoItem} from './todoitem.model';

export interface ImageAttributes {
    imageId: number;
    file: Blob;
    postId: number;
}

export interface ImageCreationAttributes extends Optional<ImageAttributes, 'imageId'> { }

export class Image extends Model<ImageAttributes, ImageCreationAttributes> implements ImageAttributes {
    // public static associations: {
    //     product: Association<TodoItem, Image>;
    // };

    imageId!: number;
    file!: Blob;
    postId!: number;

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
                }
            },
            { tableName: 'images', sequelize }
        );
    }

    // public static createAssociations() {
    //     ItemImage.belongsTo(TodoItem, {
    //         targetKey: 'todoItemId',
    //         as: 'item',
    //         onDelete: 'cascade',
    //         foreignKey: 'todoItemId'
    //     });
    // }
}





// import {Optional, Model, Sequelize, DataTypes, Association, HasManyGetAssociationsMixin, HasManyAddAssociationMixin} from 'sequelize';

// export interface ImageAttributes {
//     postId: number;
//     imageId: number;
//     image: Blob;
// }


// // tells sequelize that postId is not a required field
// export interface ImageCreationAttributes extends Optional<Image, 'postId'> { }


// export class Image extends Model<ImageAttributes, ImageCreationAttributes> implements ImageAttributes {


//     postId!: number;
//     imageId!: number;
//     image!: Blob;

//     // public getComments!: HasManyGetAssociationsMixin<Comment>;
//     // public addComment!: HasManyAddAssociationMixin<Comment, number>;

//     // public readonly Comments?: Comment[];


//     public static initialize(sequelize: Sequelize) { // definition for database
//         Image.init({
//             postId: {
//                 type: DataTypes.INTEGER,
//                 // autoIncrement: true,
//                 // primaryKey: true
//             },
//             imageId: {
//                 type: DataTypes.INTEGER,
//                 primaryKey: true
//             },
//             image: {
//                 type: DataTypes.BLOB
//             }
//         },
//         { sequelize, tableName: 'images' }
//         );

//     }

//     // public static createAssociations() {
//     //     Post.hasMany(Comment, {
//     //         as: 'Comments',
//     //         foreignKey: 'postId'
//     //     });
//     //     Post.hasMany(UserPostVote, {
//     //         as: 'PostVote',
//     //         foreignKey: 'postId'
//     //     });
//     // }

// }

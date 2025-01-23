'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Comment extends Model {
        static associate(models) {
            Comment.belongsTo(models.Post, { foreignKey: 'postId', as: 'post' });
            Comment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        }
    }

    Comment.init(
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
            },
            postId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Posts',
                    key: 'id',
                },
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: 'Comment',
        }
    );

    return Comment;
};

'use strict';
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      Post.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Post.hasMany(models.Comment, { foreignKey: 'postId', as: 'comments' });
      Post.hasMany(models.Like, { foreignKey: 'postId' });
    }
  }

  Post.init(
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
      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true, // Optional field
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Post',
    }
  );

  return Post;
};
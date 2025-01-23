'use strict';
const {
  Model
} = require('sequelize');

const bcrypt = require('bcryptjs');

const slugify = (text) => {
  return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .trim();
};

module.exports = (sequelize, DataTypes) => {
  class User extends Model {

    static associate(models) {
      User.hasMany(models.Post, { foreignKey: 'userId', as: 'posts' });

      User.hasMany(models.Comment, { foreignKey: 'userId', as: 'comments' });

      User.hasMany(models.Like, { foreignKey: 'userId', as: 'likes' });

      User.belongsToMany(models.User, {
        through: models.Follow,
        as: 'followers',
        foreignKey: 'followedId',
      });
      User.belongsToMany(models.User, {
        through: models.Follow,
        as: 'following',
        foreignKey: 'followerId',
 });
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      displayName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      bio: {
        type: DataTypes.TEXT,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      }
  }, {
    sequelize,
    modelName: 'User',
  });
  
  User.beforeSave(async (user) => {
    if (user.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  User.beforeValidate(async (user) => {
    if (user.username && !user.slug) {
        user.slug = slugify(user.username);
    }
});


  return User;
};
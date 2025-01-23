'use strict';

const bcrypt = require('bcryptjs');
const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') 
    .replace(/^-+|-+$/g, '')    
    .trim();
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = [
      {
        username: 'user1',
        email: 'user1@example.com',
        password: await bcrypt.hash('password123', 10),
        displayName: 'User One',
        bio: 'This is user one.',
        slug: slugify('user1'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'user2',
        email: 'user2@example.com',
        password: await bcrypt.hash('password456', 10),
        displayName: 'User Two',
        bio: 'This is user two.',
        slug: slugify('user2'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'user3',
        email: 'user3@example.com',
        password: await bcrypt.hash('password789', 10),
        displayName: 'User Three',
        bio: 'This is user three.',
        slug: slugify('user3'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    console.log('Seeding users:', users); // Debugging output

    return queryInterface.bulkInsert('Users', users);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {});
  },
};
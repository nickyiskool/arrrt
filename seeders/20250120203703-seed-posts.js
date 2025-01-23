'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Fetch users to assign valid userIds
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM Users;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0) {
      throw new Error('No users found. Seed the Users table first.');
    }

    const posts = [
      {
        userId: users[0].id, // Assign to the first user
        image: 'https://placehold.co/600x400',
        title: 'Beautiful Sunset',
        description: 'A stunning sunset over the ocean.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: users[1]?.id || users[0].id, // Assign to the second user if available, otherwise the first
        image: 'https://placehold.co/600x400',
        title: 'Mountain Retreat',
        description: 'A peaceful mountain landscape.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: users[2]?.id || users[0].id, // Assign to the third user if available, otherwise the first
        image: 'https://placehold.co/600x400',
        title: 'City Lights',
        description: 'A vibrant city skyline at night.',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    console.log('Seeding posts:', posts); // Debugging output

    return queryInterface.bulkInsert('Posts', posts);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Posts', null, {});
  },
};
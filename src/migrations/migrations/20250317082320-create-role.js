'use strict';


/** @type {import('sequelize-cli').Migration} */
export default  {
    async up(queryInterface, Sequelize) {
        console.log('object');
        await queryInterface.addColumn('user', 'role', {
            type: Sequelize.ENUM,
            values: ['depot', 'station','head'],
            allowNull: true
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('user', 'role')
    }
};

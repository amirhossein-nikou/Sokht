'use strict';

import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";
import { UserRole } from "src/modules/user/enum/role.enum";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        console.log('object');
        // await queryInterface.addColumn('user', 'role', {
        //     type: DataType.ENUM,
        //     values: [UserRole.OilDepotUser, UserRole.StationUser, UserRole.headUser],
        //     allowNull: true
        // })
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('user','role')
    }
};

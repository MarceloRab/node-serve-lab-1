//const { db, sequelize } = require('../../models');
const Sequelize = require('sequelize');

const batchUsers = async (keys, db) => {

    //console.log("loaders userers" + JSON.stringify(keys));
    const users = await db.user.findAll({
        where: {
            id: {
                //$in: keys,
                [Sequelize.Op.in]: keys,
            },
        },
    });

    //console.log("loaders userers" + JSON.stringify(users));

   // let lisKeyUser = keys.map(key => users.find(user => user.id === key));

    //console.log("loaders user" + JSON.stringify(listKeysUSers));

    return keys.map(key => users.find(user => user.id === key));
};

const user = {batchUsers};

module.exports = user;
const { ForbiddenError } = require('apollo-server-express');
const { combineResolvers, skip } = require('graphql-resolvers');

// booleans para manipular banco


var isAuthenticated = function (parent, args, { userLogado }) {

    //console.log('autorização - token- '+ userLogado.username);
    userLogado ? skip : new ForbiddenError('Not authenticated as user.');
}

//função protetora dos resolvers - usuario inexistente não cria mensagem por exmeplo
//para ser usada combinada em qualquer resolver que quiser - vide createMessage resolver message

// ver se o usuario é o proprietário do token - que tem a chave - dai ele poderia deletar mensagem
var isMessageOwner = async (
    parent,
    { id },
    { models, userLogado },
) => {
    const message = await models.Message.findByPk(id, { raw: true });

    if (message.userId !== userLogado.id) {
        throw new ForbiddenError('Not authenticated as owner.');
    }

    return skip;
};


// adicionando funçaõ de administrador para deletar user

var isAdmin = combineResolvers(
    isAuthenticated,
    (parent, args, { userLogado: { role } }) =>
        role === 'ADMIN'
            ? skip
            : new ForbiddenError('Not authorized as admin.'),
);

module.exports = { isAuthenticated, isMessageOwner, isAdmin };
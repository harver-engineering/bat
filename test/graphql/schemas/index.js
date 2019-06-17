const graphql = require('graphql');

class Pet {

    constructor(id, name, type) {
        this.id = id;
        this.name = name;
        this.type = type;
    }
}


const petsData = [new Pet('1000', 'cat', 'Felix'), new Pet('2000', 'dog', 'Rover')];


const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = graphql;

const PetType = new GraphQLObjectType({
    name:'Pet',
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        type: { type: GraphQLString },
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        pet: {
            type: PetType,
            args: { id: { type: GraphQLString } },
            resolve(parent, args) {
                return petsData.find(petsData => petsData.id === args.id);
            }
        },

        pets: {
            type: new GraphQLList(PetType),
            resolve() {
                return petsData;
            }
        },
    }
});

const Mutation = new GraphQLObjectType({
    name:'Mutation',
    fields: {
        addPet: {
            type: PetType,
            args:{
                id: { type: new GraphQLNonNull(GraphQLString) },
                name: { type: new GraphQLNonNull(GraphQLString) },
                type: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve(parent, args){
                const newPet = new Pet(args.id, args.type, args.name);
                petsData.push(newPet);
                return newPet;
            }
        },
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});

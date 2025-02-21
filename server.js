const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt, GraphQLNonNull } = require('graphql');

const app = express();

const authors = [
    { id: 1, name: 'J. K. Rowling' },
    { id: 2, name: 'George R. R. Martin' },
    { id: 3, name: 'J.R.R. Tolkien' },
    { id: 4, name: 'Agatha Christie' },
    { id: 5, name: 'Stephen King' }
];

const books = [
    { id: 1, name: "Harry Potter and the Sorcerer's Stone", authorId: 1 },
    { id: 2, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
    { id: 3, name: 'A Game of Thrones', authorId: 2 },
    { id: 4, name: 'A Clash of Kings', authorId: 2 },
    { id: 5, name: 'The Fellowship of the Ring', authorId: 3 },
    { id: 6, name: 'The Two Towers', authorId: 3 },
    { id: 7, name: 'Murder on the Orient Express', authorId: 4 },
    { id: 8, name: 'The Shining', authorId: 5 },
    { id: 9, name: 'It', authorId: 5 }
];

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represents a book written by an author',
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLInt) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLInt) },
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId);
            }
        }
    })
});

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represents a author',
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLInt) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => author.id === book.authorId);
            }
        }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'Query',
    description: "Root Query",
    fields: () => ({
        book: {
            type: BookType,
            description: "A book",
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => books.find(book => book.id === args.id)
        },
        author: {
            type: AuthorType,
            description: "An author",
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => authors.find(author => author.id === args.id)
        },
        books: {
            type: new GraphQLList(BookType),
            description: "List of books",
            resolve: () => books
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: "List of All authors",
            resolve: () => authors
        }
    })
});

const RootMutationType = new GraphQLObjectType({
    name: "Mutation",
    description: "Mutation root",
    fields: () => ({
        addBook: {
            type: BookType,
            description: "Add a book",
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const book = {
                    id: books.length + 1,  // New book id
                    name: args.name,        // Book name
                    authorId: args.authorId // Author id
                };
                books.push(book);  // Push the new book into the `books` array
                return book;  // Return the newly created book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: "Add an author",
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve: (parent, args) => {
                const author = {
                    id: authors.length + 1,  // New book id
                    name: args.name,        // Book name
                };
                authors.push(author);  // Push the new book into the `books` array
                return author;  // Return the newly created book
            }
        }
    })
});

// Define the Schema using `GraphQLSchema`
const schema = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutationType
});

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true  // Enables GraphiQL UI
}));

// Start the server
app.listen(5000, () => console.log('Server running on http://localhost:5000/graphql'));

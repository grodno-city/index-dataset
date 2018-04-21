module.exports = {
  connection: {
    host: 'localhost',
    port: 27017,
    name: 'library',
  },
  application: {
    port: 8080,
    DEBUG: true,
  },
  elasticHost: 'localhost',
  elasticPort: 9200,
  step: 500,
  snapshot: './.index-books-snapshot',
};

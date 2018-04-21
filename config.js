module.exports = {
  connection: {
    host: 'localhost',
    port: 27017,
    name: 'library',
  },
  application: {
    step: 500,
    snapshot: './.index-books-snapshot',
  },
  elasticHost: 'localhost',
  elasticPort: 9200,
};

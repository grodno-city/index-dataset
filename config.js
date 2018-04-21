module.exports = {
  mongodb: {
    host: 'localhost',
    port: 27017,
    name: 'library',
  },
  application: {
    step: 500,
    snapshot: './.index-books-snapshot',
  },
  elasticsearch: {
    host: 'http://localhost:9200',
    index: 'records',
    type: 'info',
  },
};

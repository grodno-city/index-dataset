import assert from 'assert';
import { MongoClient } from 'mongodb';
import elasticsearch from 'elasticsearch';

import localConfig from './config';
import processItem from './processItem';
import fake from './fake.json';

const STEP = 500;

function indexRecord(startValue, nPerPage, db, client) {
  const endValue = null;
  db.books
    .find({ _id: { $gt: startValue } })
    .sort({ _id: 1 })
    .limit(nPerPage)
    .then((books) => {
      processItem(books, (processItemErr, body) => {
        if (processItemErr) {
          console.error('error: ', processItemErr);
          db.connection.close();
          return;
        }
        client.bulk({ body }, (bulkErr) => {
          if (bulkErr) {
            console.error('error: ', processItemErr);
            db.connection.close();
          }
        });
      });
    });

  return endValue;
}

const client = new elasticsearch.Client({
  host: `http://${localConfig.elasticHost}:${localConfig.elasticPort}`,
  requestTimeout: 300000,
  // log: 'trace',
});

const url = `mongodb://${localConfig.connection.host}/${localConfig.connection.name}`;

MongoClient.connect(
  url,
  async (connectionErr, db) => {
    assert.equal(null, connectionErr);
    console.log('Connected correctly to server.');

    const collection = db.collection('books');
    let currentId = collection.find({ $minKey: 1 });

    while (currentId !== null) {
      currentId = indexRecord(currentId, STEP, db, client);
    }
  });

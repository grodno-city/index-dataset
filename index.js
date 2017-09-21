import assert from 'assert';
import { MongoClient } from 'mongodb';
import elasticsearch from 'elasticsearch';

import localConfig from './config';
import processItem from './processItem';

const client = new elasticsearch.Client({
  host: `http://${localConfig.elasticHost}:${localConfig.elasticPort}`,
  requestTimeout: 300000,
  // log: 'trace',
});

const url = `mongodb://${localConfig.connection.host}/${localConfig.connection.name}`;

MongoClient.connect(
  url,
  (connectionErr, db) => {
    assert.equal(null, connectionErr);
    console.log('Connected correctly to server.');

    const collection = db.collection('books');

    collection.count().then((count) => {
      console.log('Count of Records: ', count);
    });

    collection.find({}, (findErr, resultCursor) => {
      function indexItem(err, item) {
        if (item === null) {
          return; // All done!
        }
        processItem(item, (processItemErr, body) => {
          client.bulk({ body }, (bulkErr) => {
            if (bulkErr) {
              db.connection.close();
            }
            resultCursor.nextObject(indexItem);
          });
        });
      }
      resultCursor.nextObject(indexItem);
    });
  });

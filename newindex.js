import assert from 'assert';
import { MongoClient } from 'mongodb';
import elasticsearch from 'elasticsearch';
import fs from 'fs';

import fundsMap from './fundsMap.json';
import localConfig from './config';
import fieldsMap from './fieldsMap.json';

const client = new elasticsearch.Client({
  host: `${localConfig.elasticHost}:${localConfig.elasticPort}`,
  requestTimeout: 300000,
  // log: 'trace',
});

const url = `mongodb://${localConfig.connection.host}/${localConfig.connection.name}`;

MongoClient.connect(url, (connectionErr, db) => {
  assert.equal(null, connectionErr);

  console.log('Connected correctly to server.');

  const collection = db.collection('books');
  let recordCount = 0;
  collection.count().then((count) => {
    recordCount = count;
    console.log('Count of Records: ', count);
  });
  collection.find((collectionErr, cursor) => {
    assert.equal(null, collectionErr);
    let memory = [];
    let body = [];
    let recordsCount = 0;
    cursor.each((cursorErr, item) => {
      assert.equal(null, cursorErr);
      if (item != null) {
        body.push(0);
        if (recordsCount === 70) {
          recordsCount = 0;
          memory = memory.concat(body);
          body = [];
        } else {
          recordsCount += 1;
        }
      } else {
        memory = memory.concat(body);
        console.log("That's all! ");
        console.log('records in mongo: ', recordCount);
        console.log('Process: ', memory.length);
        db.close();
        fs.writeFileSync('fundsMap.json', JSON.stringify(fundsMap, null, 2));
        fs.writeFileSync('fieldsMap.json', JSON.stringify(fieldsMap, null, 2));
      }
    });
  });
});

import assert from 'assert';
import { MongoClient } from 'mongodb';
import elasticsearch from 'elasticsearch';
import fs from 'fs';

import map from './fundsMap.json';
import localConfig from './config';

const client = new elasticsearch.Client({
  host: `${localConfig.elasticHost}:${localConfig.elasticPort}`,
});

function expandMap(fundsName) {
  if (map[fundsName] === undefined) {
    map[fundsName] = Object.keys(map).length + 1;
  }
}

function indexReferences(record, callback) {
  const body = [];
  record.funds.forEach((fund) => {
    body.push({ index:  { _index: 'funds', _type: map[fund.name], _id: record.id } });
    body.push({ recordID: record.id, count: fund.count });
  });

  client.bulk({
    body,
  }, callback);
}

const url = `mongodb://${localConfig.connection.host}/${localConfig.connection.name}`;

MongoClient.connect(url, (connectionErr, db) => {
  assert.equal(null, connectionErr);
  console.log('Connected correctly to server.');
  const collection = db.collection('raw-data-set');
  collection.find().toArray((err, docs) => {
    assert.equal(null, err);
    docs.forEach((doc) => {
      if (doc.funds.length !== 0) {
        doc.funds.map(fund => fund.name).forEach(expandMap);
        indexReferences(doc, (indexErr) => {
          if (err) {
            console.log(doc.id, indexErr.code);
          }
        });
      }
    });

    db.close();
    fs.writeFileSync('fundsMap.json', JSON.stringify(map, null, 2));
  });
});

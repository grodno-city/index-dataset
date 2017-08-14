import assert from 'assert';
import { MongoClient } from 'mongodb';
import elasticsearch from 'elasticsearch';
import fs from 'fs';

import fundsMap from './fundsMap.json';
import localConfig from './config';
import fieldsMap from './fieldsMap.json';

const client = new elasticsearch.Client({
  host: `${localConfig.elasticHost}:${localConfig.elasticPort}`,
  // log: 'trace',
});

function indexFunds(body, record) {
  record.funds.forEach((fund) => {
    if (fundsMap[fund.name] === undefined) {
      fundsMap[fund.name] = Object.keys(fundsMap).length + 1;
    }
    body.push({ index:  { _index: 'funds', _type: fundsMap[fund.name], _id: record.id } });
    body.push({ recordID: record.id, count: fund.count });
  });
  return body;
}

function indexReferences(body, record) {
  record.references.forEach((ref) => {
    const values = ref.value.split('*');
    values.forEach((val) => {
      body.push({ index:  { _index: 'references', _type: ref.tag, _id: record.id } });
      body.push({ recordID: record.id, value: val });
    });
  });
  return body;
}

function indexFields(body, record) {
  record.fields.forEach((field) => {
    if (fieldsMap[field.tag] === undefined) {
      fieldsMap[field.tag] = Object.keys(fieldsMap).length + 1;
    }
    body.push({ index:  { _index: 'fields', _type: fieldsMap[field.tag], _id: record.id } });
    body.push({ recordID: record.id, value: field.value });
  });
  return body;
}


function indexRecord(record, callback) {
  const body = [
    { index:  { _index: 'raw', _type: 'def', _id: record.id } },
    { record },
  ].concat(indexFields([], record))
  .concat(indexFunds([], record))
  .concat(indexReferences([], record));
  callback(body);
}


const url = `mongodb://${localConfig.connection.host}/${localConfig.connection.name}`;

MongoClient.connect(url, (connectionErr, db) => {
  assert.equal(null, connectionErr);
  console.log('Connected correctly to server.');
  const collection = db.collection('books');
  collection.find((err, cursor) => {
    cursor.each((err, item) => {

      if (item != null) {
        indexRecord(item, (body) => {
          if (body.length !== 0) {
            client.bulk({
              body,
            }, (indexErr) => {
              if (indexErr) {
                console.log(item.id, indexErr.message);
              } else {
                console.log(item.id);
              }
            });
          }
        });
      } else {
        console.log("That's all!");
        db.close();
        fs.writeFileSync('fundsMap.json', JSON.stringify(fundsMap, null, 2));
        fs.writeFileSync('fieldsMap.json', JSON.stringify(fieldsMap, null, 2));
      }
    });
  });
});

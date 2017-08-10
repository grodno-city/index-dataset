import assert from 'assert';
import { MongoClient } from 'mongodb';
import elasticsearch from 'elasticsearch';
import fs from 'fs';

import localConfig from './config';

const client = new elasticsearch.Client({
  host: `${localConfig.elasticHost}:${localConfig.elasticPort}`,
});

var url = 'mongodb://'+localConfig.connection.host+'/'+localConfig.connection.name;
const map = {};
// const map ={
//   'Книгохранение,фондир.,стандарт.': 1,
// }

MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server.");
  const collection = db.collection('raw-data-set');
  collection.find().toArray(function(err, docs) {
      assert.equal(null, err);
      docs.slice(0,100).forEach((doc) => {
        if (doc.funds.length !== 0) {
          doc.funds.map(fund => fund.name).forEach(expandMap);
          indexReferences(doc, (err, resp) => {
            if(err) {
              console.log(doc.id, err.code);
            }
          });
        }
      });

      db.close();
      console.log(map);
      fs.writeFileSync('fundsMap.json', JSON.stringify(map, null, 2));
    });
});

function expandMap (fundsName) {
  if (map[fundsName] === undefined) {
    map[fundsName] = Object.keys(map).length + 1;
  }
}

function indexReferences(record, callback){
  const body = [];
  record.funds.forEach((fund) => {
    body.push({ index:  { _index: 'funds', _type: map[fund.name], _id: record.id } });
    body.push({ recordID: record.id, count: fund.count });
  });

  client.bulk({
  body
}, callback);
}

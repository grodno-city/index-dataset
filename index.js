import assert from 'assert';
import { MongoClient } from 'mongodb';
import elasticsearch from 'elasticsearch';

import localConfig from './config';

const client = new elasticsearch.Client({
  host: `${localConfig.elasticHost}:${localConfig.elasticPort}`,
});

var url = 'mongodb://'+localConfig.connection.host+'/'+localConfig.connection.name;

MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server.");
  const collection = db.collection('raw-data-set');
  // collection.find().toArray(function(err, docs) {
  //     assert.equal(null, err);
  //     docs.slice(0,1).forEach((doc) => {
  //       console.log(doc.id);
  //       indexReferences(doc, (err, resp) => {
  //         if(err) console.log(err);
  //       })
  //     })
  //
  //     db.close();
  //   });
  indexReferences(null, (err, resp) => {
    if(err) console.log(err);
    else {
      console.log(resp);
    }
  })
});

const map ={
  label: 'Книгохранение,фондир.,стандарт.',
  tag: 1,
}

function indexReferences(record, callback){
  // const body = [];
  // record.funds.forEach((fund) => {
  //   body.push({ index:  { _index: 'funds', _type: fund.name, _id: record.id } });
  //   body.push({ recordID: record.id, count: fund.count });
  // });
  const body =[ { index:
     { _index: 'funds',
       _type: 1,
       _id: 231 } },
  { recordID: 231, count: 1 } ];

  client.bulk({
  body
}, callback);
}

function indexRecord(record, callback) {
  client.index({
    index: 'references',
    type: record.references,
    id: record.id,
    body: {
      record,
    },
  }, callback);
}

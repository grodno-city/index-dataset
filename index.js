import assert from 'assert';
import { MongoClient } from 'mongodb';
import elasticsearch from 'elasticsearch';
import fs from 'fs';
import whilst from 'async/whilst';

import localConfig from './config';
import processItem from './processItem';

const STEP = localConfig.application.step;
const snapshot = localConfig.application.snapshot;

async function indexRecord(startValue, nPerPage, db, client) {
  console.log('startValue: ', startValue);
  console.log('nPerPage: ', nPerPage);
  console.log('----------------------------------');
  const recordsArray = await db.collection('books')
    .find({ id: { $gte: startValue } })
    .sort({ id: 1 })
    .limit(nPerPage)
    .toArray();

  const body = await processItem(recordsArray);
  await client.bulk({ body })
    .then((result) => {
      if (result.error) {
        console.error('error: ', result.items[0].index.error);
        fs.writeFileSync(snapshot, `${startValue}`);
        db.close();
      }
    });
}

const client = new elasticsearch.Client({
  host: localConfig.elasticsearch.host,
  requestTimeout: 300000,
});

const url = `mongodb://${localConfig.mongodb.host}/${localConfig.mongodb.name}`;

MongoClient.connect(
  url,
  async (connectionErr, db) => {
    assert.equal(null, connectionErr);
    console.log('Connected correctly to server.');

    const collection = db.collection('books');
    let lastValue =
      await collection.find({}, { id: 1, _id: 0 }).sort({ id: -1 }).limit(1).toArray();

    lastValue = lastValue[0].id;

    let currentId = -1;
    if (fs.existsSync(snapshot)) {
      currentId = Number(fs.readFileSync(snapshot, 'utf8'));
    } else {
      currentId =
        await collection.find({}, { id: 1, _id: 0 }).sort({ id: +1 }).limit(1).toArray();
      currentId = currentId[0].id;
    }

    console.log('last records id: ', lastValue);
    console.log('first records id: ', currentId);

    whilst(
      () => (currentId <= lastValue),
      (callback) => {
        indexRecord(currentId, STEP, db, client)
          .then(() => {
            currentId += STEP;
            return callback();
          });
      });
  });

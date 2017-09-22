import fs from 'fs';

import fundsMap from './fundsMap.json';
import referencesMap from './referencesMap.json';

export default (record, callback) => {
  const body = [
    { index:  { _index: 'raw', _type: 'def', _id: record.id } },
    { record },
  ];
  record.fields.forEach((field) => {
    if (referencesMap[field.tag] === undefined) {
      referencesMap[field.tag] = Object.keys(referencesMap).length + 1;
    }
    body.push({ index:  { _index: 'fields', _type: referencesMap[field.tag], _id: record.id } });
    body.push({ recordID: record.id, value: field.value });
  });
  record.references.forEach((ref) => {
    const values = ref.value.split('*');
    values.forEach((val) => {
      body.push({ index:  { _index: 'references', _type: ref.tag, _id: record.id } });
      body.push({ recordID: record.id, value: val });
    });
  });
  record.funds.forEach((fund) => {
    if (fundsMap[fund.name] === undefined) {
      fundsMap[fund.name] = Object.keys(fundsMap).length + 1;
    }
    body.push({ index:  { _index: 'funds', _type: fundsMap[fund.name], _id: record.id } });
    body.push({ recordID: record.id, count: fund.count });
  });

  fs.writeFileSync('fundsMap.json', JSON.stringify(fundsMap, null, 2));
  fs.writeFileSync('referencesMap.json', JSON.stringify(referencesMap, null, 2));
  return callback(null, body);
};

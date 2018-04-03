export default (records, callback) => {
  const body = [];
  records.forEach((record) => {
    const newRefs = [];
    record.references.forEach((ref) => {
      ref.value.split('*').forEach(value => newRefs.push({ value, tag: ref.tag }));
    });

    body.push({ index:  { _index: 'records', _type: 'record', _id: record.id } });
    record.references = newRefs; // eslint-disable-line
    body.push(record);
  });
  return callback(null, body);
};

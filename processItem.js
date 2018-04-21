export default (records) => {
  const body = [];
  records.forEach((record) => {
    const newRefs = [];
    const copy = record;
    copy.references.forEach((ref) => {
      ref.value.split('*').forEach(value => newRefs.push({ value, tag: ref.tag }));
    });

    body.push({ index:  { _index: 'records', _type: 'info', _id: copy.id } });
    copy.references = newRefs; // eslint-disable-line
    delete copy.years;
    delete copy._id;
    body.push(copy);
  });
  return body;
};

import localConfig from './config';

export default (records) => {
  const body = [];
  records.forEach((record) => {
    const newRefs = [];
    const copy = record;
    copy.references.forEach((ref) => {
      ref.value.split('*').forEach(value => newRefs.push({ value, tag: ref.tag }));
    });

    body.push({ index:  { _index: localConfig.index, _type: localConfig.type, _id: copy.id } });
    copy.references = newRefs;
    delete copy.years;
    delete copy._id;
    body.push(copy);
  });
  return body;
};

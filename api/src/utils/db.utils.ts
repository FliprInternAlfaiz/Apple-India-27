import { Document, Schema } from 'mongoose';

const handleDuplicates = (schema: Schema, feild: string) => {
  schema.pre('save', async function (next) {
    const doc = this as Document;
    if (!doc.isNew) return next();

    const collection = this.collection;
    const filter = {} as any;

    filter[feild] = doc[feild as keyof Document];

    const isExists = await collection.findOne(filter);

    if (isExists) return next(new Error(`${feild} must be unique`));

    return next();
  });
};

const registerDaos = (schema: Schema, dao: any) => {
  Object.entries(dao).forEach(([name, method]) => {
    schema.statics[name] = method as any;
  });
};

export default {
  handleDuplicates,
  registerDaos,
};

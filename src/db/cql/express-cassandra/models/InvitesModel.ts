import { IInvite } from '@Project.Database/schemas/invites.schema';
import { SchemaDefinition } from '../schema';

const model: SchemaDefinition<IInvite> = {
  table_name: 'invites',
  fields: {
    code: 'text',
    chan_id: 'bigint',
    creator_id: 'bigint'
  },
  key: ['code']
};

export default model;

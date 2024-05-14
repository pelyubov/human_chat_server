export default {
  fields: {
    user_id: {
      type: 'bigint',
      required: true
    },
    email: {
      type: 'text',
      required: true
    },
    credentials: {
      type: 'text',
      required: true
    }
  },
  key: ['user_id']
};

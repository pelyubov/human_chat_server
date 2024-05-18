import { mapping as DataStaxMapping } from 'cassandra-driver';

export const mapping: DataStaxMapping.ModelOptions = {
  tables: ['auth'],
  columns: {
    user_id: {
      name: 'user_id',
      toModel(columnValue) {
        return BigInt(columnValue);
      },
      fromModel(modelValue) {
        return modelValue.toString();
      }
    }
  }
};

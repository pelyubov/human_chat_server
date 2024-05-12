import cassandra from 'cassandra-driver';

const client = new cassandra.Client({
  contactPoints: [
    // '192.168.194.80'
    // '192.168.43.114',
    '172.24.10.1'
  ],
  localDataCenter: 'SAYURI_DC1',
  keyspace: 'hn',
  protocolOptions: {
    port: 9042,
    maxVersion: cassandra.types.protocolVersion.maxSupported
  }
});

client
  .connect()
  .then(() => console.log('Connected to Cassandra'))
  .catch(console.error);

  
import { Client, ClientOptions, types } from 'cassandra-driver';
// import { dseGraph } from 'cassandra-driver-graph';
import { config } from 'dotenv';
config();

const cassandraOptions: ClientOptions = {
  contactPoints: [process.env.CASSANDRA_HOST || 'localhost'],
  localDataCenter: 'datacenter1',
  keyspace: process.env.CASSANDRA_KEYSPACE,
  //   credentials: {
  //     username: process.env.CASSANDRA_USERNAME,
  //     password: process.env.CASSANDRA_PASSWORD,
  //   },
  // profiles: [
  //     dseGraph.createExecutionProfile('explicit-exec', {
  //         graphOptions: {
  //             name: 'HUMAN_CHAT_DB',
  //             graphProtocol: graphProtocol.graphson3,
  //             graphLanguage: 'gremlin-groovy',
  //         }
  //     }),
  // ],
  protocolOptions: {
    maxVersion: types.protocolVersion.maxSupported,
    port: +(process.env.CASSANDRA_PORT || 9042),
  },
};

// executeGraph = (query) => client
//     .executeGraph(query, null, {
//         executionProfile: 'explicit-exec',
//         graphResults: 'graphson-3.0'
//     })

// executeGraph(query).then(res => console.log(res.toArray()));

// client.execute("INSERT INTO message (message_id, context, message_type) VALUES (863ceec0-9509-4cd1-91c0-0141494c6585, 'hello', 'text'); ").then(console.log).catch(console.log);
// client.execute("SELECT * FROM message").then(console.log).catch(console.log);

const client = new Client(cassandraOptions);

client
  .connect()
  .then(() => {
    console.log('Connected to cassandra db');
  })
  .catch((e) => {
    console.error('Error connecting to cassandra db', e);
  });

export { client };

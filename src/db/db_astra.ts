const cassandra = require('cassandra-driver');

const cloud = { secureConnectBundle: 'secure-connect-humanchat-db.zip' };
const authProvider = new cassandra.auth.PlainTextAuthProvider(
  'token',
  'AstraCS:mbEevQGkJpMbCajbdDRtOgBd:f678f4b8817f40daf6c20a610ac7ad126a51e0c69b919cdbdc5b90d89c311d14',
);
const client = new cassandra.Client({ cloud, authProvider });

async function run() {
  await client.connect();
  const result = await client.execute('SELECT * FROM default_keyspace.movie_reviews;');
  console.log(result);
  await client.shutdown();
}

run();

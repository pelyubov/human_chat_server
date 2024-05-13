enum DbState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'connectError',
  EXECUTE_START = 'executeStart',
  EXECUTE_DONE = 'executeDone',
}

export default DbState;

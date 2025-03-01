import figlet from 'figlet';

export const printSyncMaster = () => {
  const output = figlet.textSync('SyncMaster', 'Big');
  console.log('\x1b[32m%s\x1b[0m', output);
};

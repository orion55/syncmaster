import figlet from 'figlet';
import colors from 'ansi-colors';

export const printSyncMaster = () => {
  const output = figlet.textSync('SyncMaster', 'Big');
  console.log(colors.green(output));
};

import figlet, { Fonts } from 'figlet';

export const printSyncMaster = () =>
  console.log(
    figlet.textSync('SyncMaster', {
      font: 'big' as Fonts,
    }),
  );

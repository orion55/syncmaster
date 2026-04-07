import cfonts from 'cfonts';

export const printSyncMaster = () => {
  cfonts.say('SyncMaster', {
    font: 'block',
    colors: ['green', 'gray'],
    background: 'transparent',
  });
};

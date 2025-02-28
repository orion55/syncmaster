import { printSyncMaster } from './libs/greeting';

const main = async (): Promise<void> => {
  try {
    printSyncMaster();
  } catch (error) {
    console.error('Ошибка:', error);
  }
};

main();

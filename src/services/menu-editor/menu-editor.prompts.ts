import { createInterface, type Interface } from 'readline/promises';
import { stdin, stdout } from 'process';
import colors from 'ansi-colors';

let rl: Interface;

export const initReadline = (): void => {
  rl = createInterface({ input: stdin, output: stdout });
};

export const closeReadline = (): void => {
  rl.close();
};

export const ask = async (prompt: string): Promise<string> => {
  const answer = await rl.question(colors.cyan('? ') + prompt + ' ');
  return answer.trim();
};

export const askIndex = async (prompt: string, max: number): Promise<number | null> => {
  const answer = await ask(prompt);
  if (answer === '0' || answer.toLowerCase() === 'q' || answer === '') return null;
  const num = parseInt(answer, 10);
  if (isNaN(num) || num < 1 || num > max) return null;
  return num - 1;
};

export const confirm = async (prompt: string): Promise<boolean> => {
  const answer = await ask(`${prompt} [y/N]`);
  return answer.toLowerCase() === 'y';
};

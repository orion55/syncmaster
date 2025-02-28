import { SingleBar } from "src/misc/cli-progress";

// Создаем новый прогресс-бар
const bar = new SingleBar(
  {
    format: "{bar} {percentage}% | {value}/{total}", // Формат отображения прогресса
    barCompleteChar: "\u2588", // Символ для завершенной части
    barIncompleteChar: "\u2591", // Символ для незавершенной части
    hideCursor: true, // Скрытие курсора
  },
  cliProgress.Presets.shades_classic,
);

// Инициализация
const total = 100; // Общее количество шагов
bar.start(total, 0);

// Симуляция процесса копирования
let currentValue = 0;
const interval = setInterval(() => {
  currentValue++;
  bar.update(currentValue);

  if (currentValue === total) {
    clearInterval(interval);
    bar.stop();
  }
}, 100); // Обновление прогресса каждые 100 миллисекунд

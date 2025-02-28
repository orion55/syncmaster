import winston from "src/misc/winston";

// Создаем логгер с двумя транспортами: в консоль и в файл
const logger = winston.createLogger({
  level: "info", // Уровень логирования
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }), // Логирование в консоль
    new winston.transports.File({
      filename: "app.log",
      format: winston.format.simple(),
    }), // Логирование в файл
  ],
});

// Логируем сообщения
logger.info("Информационное сообщение");
logger.warn("Предупреждение");
logger.error("Ошибка");

import winston, { format } from "winston";

const { combine } = format;

const winstonConfig: winston.transports.ConsoleTransportOptions = {
  level: "info",
  handleExceptions: true,
  format: combine(
    winston.format.colorize(),
    winston.format.simple(),
    winston.format.printf(
      (options) =>
        `${options.level}: ${options.label ? `[${options.label}] ` : ""}${
          options?.message
        }`,
    ),
  ),
};

const loggerOptions: winston.LoggerOptions = {
  transports: [new winston.transports.Console(winstonConfig)],
  exitOnError: false,
};

const logger = winston.createLogger(loggerOptions);

export const createLogger = (name: string): winston.Logger =>
  logger.child({ label: name });

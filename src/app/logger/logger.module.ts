import { Module } from '@nestjs/common'
import { WinstonModule } from 'nest-winston'
import * as winston from 'winston'
import 'winston-daily-rotate-file'
import { LOGGER_DATE_PATTERN, LOGGER_DIR } from '../constant/logger.constant'

function getPrintFormat() {
  return winston.format.printf((info) => {
    const content = [
      info.timestamp,
      [
        `[${info.level}]`,
        info.context ? [info.context].flat().map((v) => `[${v}]`).join(' ') : '',
        info.message,
      ].filter((v) => v).join(' '),
      Object.keys(info.metadata).length ? JSON.stringify(info.metadata) : '',
    ].filter((v) => v).join(' | ')
    return content
  })
}

function getFileName() {
  return `${process.env.NODE_ENV || 'dev'}.%DATE%`
}

@Module({
  imports: [
    WinstonModule.forRoot({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.metadata({ fillExcept: ['timestamp', 'level', 'message'] }),
        winston.format((info) => Object.assign(info, { level: info.level.toUpperCase() }))(),
        winston.format((info) => {
          const { metadata } = info
          if (metadata.context) {
            Object.assign(info, { context: metadata.context })
            delete metadata.context
          }
          return info
        })(),
      ),
      transports: [
        new winston.transports.Console({
          level: 'debug',
          format: winston.format.combine(
            winston.format.colorize(),
            getPrintFormat(),
          ),
        }),

        new winston.transports.DailyRotateFile({
          level: 'debug',
          format: winston.format.combine(getPrintFormat()),
          datePattern: LOGGER_DATE_PATTERN,
          dirname: LOGGER_DIR,
          filename: `${getFileName()}.log`,
        }),

        new winston.transports.DailyRotateFile({
          level: 'error',
          format: winston.format.combine(getPrintFormat()),
          datePattern: LOGGER_DATE_PATTERN,
          dirname: LOGGER_DIR,
          filename: `${getFileName()}_error.log`,
        }),
      ],
    }),
  ],
})
export class LoggerModule { }

import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { WsAdapter } from '@nestjs/platform-ws'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import 'dotenv/config'
import { AppModule } from './app/app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  })

  app.useWebSocketAdapter(new WsAdapter(app))

  const config = new DocumentBuilder()
    .setTitle('YouTube PubSubHubbub')
    .setDescription('')
    .setVersion('1.0')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  const port = Number(process.env.PORT) || 3000
  await app.listen(port)
  console.debug(`🚀 Server listening on http://0.0.0.0:${port}`)
}

bootstrap()

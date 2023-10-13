/* eslint-disable class-methods-use-this */

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { Request } from 'express'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const id = randomUUID()
    const ctx = context.switchToHttp()
    const req = ctx.getRequest<Request>()
    const { method, body } = req
    const className = context.getClass().name
    const handlerName = context.getHandler().name
    const now = Date.now()
    console.log(`${new Date().toISOString()} | ${id} | ${method} >>> ${className}.${handlerName} | ${JSON.stringify(body)}`)

    return next.handle().pipe(
      tap(() => {
        console.log(`${new Date().toISOString()} | ${id} | ${method} <<< ${className}.${handlerName} | ${Date.now() - now}ms`)
      }),
    )
  }
}

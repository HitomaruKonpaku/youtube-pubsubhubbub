import { Request } from 'express'

export class RequestUtil {
  public static async read(req: Request): Promise<string> {
    return new Promise((resolve) => {
      let data = ''
      req.setEncoding('utf8')
      req.on('data', (chunk) => {
        data += chunk.toString()
      })
      req.once('end', () => {
        resolve(data)
      })
    })
  }
}

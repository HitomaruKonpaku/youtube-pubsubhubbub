import { Inject, Injectable, Logger } from '@nestjs/common'
import axios from 'axios'
import Bottleneck from 'bottleneck'
import { Request, Response } from 'express'
import { XMLParser } from 'fast-xml-parser'
import { WINSTON_MODULE_PROVIDER } from 'nest-winston'
import { stringify } from 'querystring'
import { EventEmitter } from 'stream'
import { parse } from 'url'
import { RequestUtil } from '../../common/util/request.util'
import { HubData } from '../interface/hub-data.interface'

@Injectable()
export class HubService extends EventEmitter {
  private hubUrl = 'https://pubsubhubbub.appspot.com'

  private callbackUrl: string = ''
  private verify: string = 'sync'
  private verifyToken: string
  private secret: string

  private limiter = new Bottleneck({ maxConcurrent: 5 })

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {
    super()

    this.hubUrl = process.env.YT_HUB_URL || this.hubUrl
    this.callbackUrl = process.env.YT_HUB_CALLBACK_URL
    this.verifyToken = process.env.YT_HUB_VERIFY_TOKEN
    this.secret = process.env.YT_HUB_SECRET

    // this.logger.debug(`hubUrl: ${this.hubUrl}`)
    // this.logger.debug(`callbackUrl: ${this.callbackUrl}`)
    // this.logger.debug(`verifyToken: ${this.verifyToken}`)
    // this.logger.debug(`secret: ${this.secret}`)
  }

  public async subscribe(topic: string) {
    const res = await this.limiter.schedule(() => axios.request({
      method: 'POST',
      url: this.hubUrl,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: stringify({
        'hub.callback': this.callbackUrl,
        'hub.topic': topic,
        'hub.mode': 'subscribe',
        'hub.verify': this.verify,
        'hub.verify_token': this.verifyToken,
        'hub.secret': this.secret,
      }),
    }))
    return res
  }

  public async subscribeChannel(id: string) {
    const topic = `https://www.youtube.com/xml/feeds/videos.xml?channel_id=${id}`
    return this.subscribe(topic)
  }

  public async subscribePlaylist(id: string) {
    const topic = `https://www.youtube.com/xml/feeds/videos.xml?playlist_id=${id}`
    return this.subscribe(topic)
  }

  public onGet(req: Request, res: Response) {
    const { query } = parse(req.url, true, true)
    if (this.verifyToken && query['hub.verify_token'] && this.verifyToken !== query['hub.verify_token']) {
      res.sendStatus(401)
      return
    }

    res.status(200).send(query['hub.challenge'])

    const data = {
      mode: query['hub.mode'],
      topic: query['hub.topic'],
    }
    if (query['hub.lease_seconds']) {
      Object.assign(data, { leaseSeconds: Number(query['hub.lease_seconds']) })
    }
    this.logger.log(`[${query['hub.mode']}]`, data)
    this.emit(query['hub.mode'] as string, data)
  }

  public async onPost(req: Request, res: Response) {
    if (this.secret && this.secret !== req.headers['x-hub-signature']) {
      res.sendStatus(403)
      return
    }

    const body = await RequestUtil.read(req)

    try {
      const parser = new XMLParser({ ignoreAttributes: false })
      const data = parser.parse(body)
      if (!data || !data.feed) {
        res.sendStatus(400)
        return
      }

      const { feed } = data
      const { entry } = feed
      if (!entry) {
        res.sendStatus(400)
        return
      }

      const topic = feed.link[1]['@_href']
      const video = {
        id: entry['yt:videoId'],
        title: entry.title,
        url: entry.link['@_href'],
      }
      const channel = {
        id: entry['yt:channelId'],
        name: entry.author.name,
        url: entry.author.uri,
      }
      const { published, updated } = entry
      const obj: HubData = { topic, video, channel, published, updated }
      this.logger.log('[data]', obj)
      this.emit('data', obj)
      res.sendStatus(200)
    } catch (error) {
      this.logger.error(`${error.message}`, body)
      res.sendStatus(500)
    }
  }
}

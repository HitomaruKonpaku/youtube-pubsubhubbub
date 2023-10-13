import { Controller, Get, Post, RawBodyRequest, Req, Res } from '@nestjs/common'
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { HubService } from '../service/hub.service'

@Controller('hub')
@ApiTags('hub')
export class HubController {
  constructor(private readonly hubService: HubService) { }

  @Get()
  @ApiOkResponse({ description: 'Return `hub.challenge`' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  onGet(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    this.hubService.onGet(req, res)
  }

  @Post()
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  onPost(
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    this.hubService.onPost(req, res)
  }
}

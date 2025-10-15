import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('csrf-token')
export class CsrfController {
  @Get()
  getToken(@Req() req: Request, @Res() res: Response) {
    // `req.csrfToken()` is provided by csurf
    const token = req.csrfToken();
    res.status(200).json({ csrfToken: token });
  }
}
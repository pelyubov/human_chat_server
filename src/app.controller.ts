import { Body, Controller, Post } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Post('test')
  test(@Body() data: any) {
    console.log(data);
    return `test ${data.a}`;
  }
}

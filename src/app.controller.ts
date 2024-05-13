import { Body, Controller, Post, SetMetadata } from '@nestjs/common';

@Controller()
export class AppController {
  @SetMetadata('skipAuth', true)
  @Post('test')
  test(@Body() data: any) {
    console.log(data);
    return `test ${data.a}`;
  }
}

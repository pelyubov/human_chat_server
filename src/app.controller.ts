import { Controller, Post, Body } from '@nestjs/common';

@Controller()
export class AppController {
  @Post('test')
  test(@Body() data: any) {
    console.log(data);
    return `test ${data.a}`;
  }
}

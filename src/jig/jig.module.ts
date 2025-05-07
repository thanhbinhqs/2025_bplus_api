import { Module } from '@nestjs/common';
import { JigService } from './jig.service';
import { JigController } from './jig.controller';

@Module({
  controllers: [JigController],
  providers: [JigService],
})
export class JigModule {}

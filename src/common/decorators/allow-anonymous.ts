/* eslint-disable prettier/prettier */
import { SetMetadata } from '@nestjs/common';

export const ALLOW_ANONYMOUS = 'allow_anonymous';

export const AllowAnonymous = (allow: boolean) => SetMetadata(ALLOW_ANONYMOUS, allow);
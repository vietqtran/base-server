import { DECORATOR_KEYS } from '@/constants/common';
import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata(DECORATOR_KEYS.IS_PUBLIC_KEY, true);

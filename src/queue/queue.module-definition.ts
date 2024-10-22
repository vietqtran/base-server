import { ConfigurableModuleBuilder } from '@nestjs/common';
import { QueueModuleOptions } from './interfaces/queue.interface';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<QueueModuleOptions>().build();

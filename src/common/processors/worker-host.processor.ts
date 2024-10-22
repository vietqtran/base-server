import { OnWorkerEvent, WorkerHost } from '@nestjs/bullmq';

import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

export abstract class WorkerHostProcessor extends WorkerHost {
  protected readonly logger = new Logger(WorkerHostProcessor.name);

  @OnWorkerEvent('progress')
  onProgress(job: Job) {
    const { id, name, progress } = job;
    this.logger.log(`Job id: ${id}, name: ${name} completes ${progress}%`);
  }
}

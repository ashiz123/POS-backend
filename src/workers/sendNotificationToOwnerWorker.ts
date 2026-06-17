import { Job, Worker } from "bullmq";
import Redis from "ioredis";
import { container, inject, injectable } from "tsyringe";
import { INotificationService } from "../features/notification/notification.type";
import { TOKENS } from "../config/tokens";
import { NotifyTerminalType } from "../features/notification/notification.model";

@injectable()
export class OwnerNotificationWorker {
  private _worker: Worker | null = null;

  constructor(
    @inject(TOKENS.NOTIFICATION_SERVICE)
    private notificationService: INotificationService,
    @inject(TOKENS.REDIS_CONNECT) private _redisConn: Redis,
  ) {}

  public setup(): Worker {
    this._worker = new Worker(
      "notificationToOwner",
      async (job: Job) => {
        if (job.name === "Approve-Terminal") {
          const { businessId, terminalId, ownerId, token } = job.data;

          const notifyData: NotifyTerminalType = {
            businessId,
            terminalId,
            ownerId,
            token,
          };

          await this.notificationService.notifyTerminalApprove(notifyData);
        }

        if (job.name === "Activate-Terminal") {
          const { businessId, terminalId, ownerId } = job.data;

          const notifyData: NotifyTerminalType = {
            businessId,
            terminalId,
            ownerId,
          };

          await this.notificationService.notifyTerminalActivate(notifyData);
        }
      },
      { connection: this._redisConn },
    );

    this._worker.on("completed", (job) => {
      console.log(`✅ Job ${job.id} (Name: ${job.name}) has completed!`);
    });

    this._worker.on("failed", (job, err) => {
      console.error(`❌ Job ${job?.id} failed with error: ${err.message}`);
    });

    return this._worker;
  }
}

container.resolve(OwnerNotificationWorker).setup();

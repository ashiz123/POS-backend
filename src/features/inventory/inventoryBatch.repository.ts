import { IInventoryBatchRepository } from "./inventoryBatch.type";
import {
  CreateInventoryBatchDTO,
  InventoryBatchBase,
  InventoryBatchDocument,
  InventoryBatchModel,
  UpdateInventoryBatchDTO,
} from "./inventoryBatch.model";
import { CrudRepository } from "../../shared/crudRepository";
import { injectable } from "tsyringe";
import { ClientSession, Types } from "mongoose";
import { NotFoundError } from "../../errors/httpErrors";

@injectable()
export class InventoryBatchRepository
  extends CrudRepository<
    InventoryBatchDocument,
    CreateInventoryBatchDTO,
    UpdateInventoryBatchDTO
  >
  implements IInventoryBatchRepository
{
  constructor() {
    super(InventoryBatchModel);
  }

  async getBatchNumberRepo(productId: string): Promise<string> {
    const stockBatch = await this.model
      .findOne({ productId: new Types.ObjectId(productId) })
      .sort({ createdAt: -1 })
      .select("batchNumber")
      .lean();
    return stockBatch ? stockBatch.batchNumber : "";
  }

  async findByProductId(productId: string): Promise<InventoryBatchBase[]> {
    return this.model
      .find({ productId: new Types.ObjectId(productId), deletedAt: null })
      .lean();
  }

  async deductBatchStock(
    batchId: string,
    qty: number,
    session?: ClientSession,
  ): Promise<void> {
    console.log("decrease quanity by expiry", batchId);
    const result = await this.model.updateOne(
      {
        _id: new Types.ObjectId(batchId),
        quantity: { $gte: qty },
      },
      {
        $inc: { quantity: -qty },
      },
      { session },
    );

    if (result.matchedCount === 0) {
      throw new NotFoundError(
        `Failed to deduct stock, Batch ${batchId} not found`,
        "Inventory batch Repository",
      );
    }
  }

  async restoreBatchBack(
    batchId: string,
    qty: number,
    session?: ClientSession,
  ): Promise<void> {
    const result = await this.model.updateOne(
      {
        _id: new Types.ObjectId(batchId),
      },
      {
        $inc: { quantity: Math.abs(qty) },
      },
      { session },
    );

    if (result.matchedCount === 0) {
      throw new NotFoundError(
        `Failed to restore stock. Batch ${batchId} not found in database.`,
        "Inventory batch Repository",
      );
    }
  }

  async decreaseTotalQuantity(
    productId: string,
    batchId: string,
    qty: number,
    session?: ClientSession,
  ): Promise<void> {
    console.log(productId, batchId);
    const result = await this.model.updateOne(
      {
        productId: new Types.ObjectId(productId),
        _id: new Types.ObjectId(batchId),
        deletedAt: { $eq: null },
        quantity: { $gte: qty },
      },
      { $inc: { quantity: -qty } },
      { session },
    );
    console.log(
      `Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`,
    );

    if (result.modifiedCount === 0) {
      throw new Error(
        `Insufficient stock for product ${productId} and batch ${batchId} `,
      );
    }
  }

  async getEarliestExpiryBatchesFirst(
    productId: string,
    session: ClientSession,
  ): Promise<InventoryBatchBase[]> {
    const batches = await this.model
      .find({
        productId,
        quantity: { $gt: 0 }, //quantity greater than 0
        expiryDate: { $gt: new Date() }, //Not expired
      })
      .session(session) //chaining session to protect from negative inventory race condition
      .sort({ expiryDate: 1 })
      .lean();

    return batches as InventoryBatchBase[];
  }

  async getSumOfAllBatches(productId: string): Promise<number> {
    const result = await this.model.aggregate([
      {
        $match: {
          productId: new Types.ObjectId(productId),
        },
      },

      {
        $group: {
          _id: null,
          totalStock: { $sum: "$quantity" },
        },
      },
    ]);

    if (result.length > 0) {
      return result[0].totalStock;
    } else {
      return 0;
    }
  }
}

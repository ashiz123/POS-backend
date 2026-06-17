import { inject, injectable } from "tsyringe";
import {
  IInventoryBatchRepository,
  IInventoryBatchService,
} from "./inventoryBatch.type";
import { TOKENS } from "../../config/tokens";
import {
  CreateInventoryBatchDTO,
  InventoryBatchBase,
  InventoryBatchDocument,
  InventoryBatchResponse,
  UpdateInventoryBatchDTO,
} from "./inventoryBatch.model";

@injectable()
export class InventoryBatchService implements IInventoryBatchService {
  constructor(
    @inject(TOKENS.INVENTORY_BATCH_REPOSITORY)
    private readonly inventoryBatchRepository: IInventoryBatchRepository,
  ) {}

  async create(
    data: CreateInventoryBatchDTO & { productId: string },
  ): Promise<InventoryBatchBase> {
    const inventoryBatch = await this.inventoryBatchRepository.create(data);
    return {
      _id: inventoryBatch._id,
      batchNumber: inventoryBatch.batchNumber,
      quantity: inventoryBatch.quantity,
      price: inventoryBatch.price,
      expiryDate: inventoryBatch.expiryDate,
    };
  }

  async update(
    id: string,
    data: UpdateInventoryBatchDTO,
  ): Promise<InventoryBatchDocument | null> {
    return this.inventoryBatchRepository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    await this.inventoryBatchRepository.delete(id);
    return true;
  }

  async getById(id: string): Promise<InventoryBatchDocument | null> {
    return this.inventoryBatchRepository.findById(id);
  }

  async getAll(): Promise<InventoryBatchDocument[]> {
    return this.inventoryBatchRepository.findAll();
  }

  async getInventoryByProductId(
    productId: string,
  ): Promise<InventoryBatchResponse[]> {
    const inventoryBatch =
      await this.inventoryBatchRepository.findByProductId(productId);

    return inventoryBatch.map((batch) => ({
      id: batch._id.toString(),
      batchNumber: batch.batchNumber,
      quantity: batch.quantity,
      price: batch.price,
      expiryDate: batch.expiryDate,
    }));
  }

  async generateBatchNumber(productId: string): Promise<string> {
    const lastBatchNumber =
      await this.inventoryBatchRepository.getBatchNumberRepo(productId);

    if (!lastBatchNumber) {
      return `BATCH-0001`;
    }

    const separate = lastBatchNumber.split("-"); //split by - in array
    const lastNumber = parseInt(separate[1]); //take the second element of array and convert to number
    const nextNumber = lastNumber + 1; //add 1 to the last number
    const paddedNumber = nextNumber.toString().padStart(4, "0"); //add leading zeros to make it 4 digits
    return `BATCH-${paddedNumber}`;
  }
}

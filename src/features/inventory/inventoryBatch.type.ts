import { ClientSession, Types } from "mongoose";
import { ICrudController } from "../../shared/crudControllerInterface";
import { ICrudRepository } from "../../shared/crudRepository";
import { ICrudService } from "../../shared/crudServiceInterface";
import {
  CreateInventoryBatchDTO,
  InventoryBatchBase,
  InventoryBatchDocument,
  InventoryBatchResponse,
  UpdateInventoryBatchDTO,
} from "./inventoryBatch.model";

export type IInventoryBatchController = ICrudController;

export interface IInventoryBatchService extends ICrudService<InventoryBatchBase> {
  create(
    data: CreateInventoryBatchDTO & { productId: string },
  ): Promise<InventoryBatchBase>; //override

  generateBatchNumber(productId: string): Promise<string>;
  getInventoryByProductId(productId: string): Promise<InventoryBatchResponse[]>;
}

export interface IInventoryBatchRepository extends ICrudRepository<
  InventoryBatchDocument,
  CreateInventoryBatchDTO,
  UpdateInventoryBatchDTO
> {
  getBatchNumberRepo(productId: string): Promise<string>;
  findByProductId(productId: string): Promise<InventoryBatchBase[]>;
  decreaseTotalQuantity(
    productId: string,
    batchId: string,
    qty: number,
    session?: ClientSession,
  ): Promise<void>;
  deductBatchStock(
    batchId: string | Types.ObjectId,
    quantity: number,
    session?: ClientSession,
  ): Promise<void>;
  restoreBatchBack(
    batchId: string | Types.ObjectId,
    qty: number,
    session?: ClientSession,
  ): Promise<void>;
  getEarliestExpiryBatchesFirst(
    productId: string,
    session: ClientSession,
  ): Promise<InventoryBatchBase[]>;
  getSumOfAllBatches(productId: string): Promise<number>;
}

import { injectable, inject } from "tsyringe";
import {
  IInventoryBatchController,
  IInventoryBatchService,
} from "./inventoryBatch.type";
import { TOKENS } from "../../config/tokens";
import { Request, Response, NextFunction } from "express";
import {
  CreateInventoryBatchSchema,
  UpdateInventoryBatchSchema,
} from "./inventoryBatch.validation";
import { ApiResponse } from "../../types/apiResponseType";
import { IProductService } from "../products/product.type";
import {
  InventoryBatchBase,
  InventoryBatchResponse,
} from "./inventoryBatch.model";

@injectable()
export class InventoryBatchController implements IInventoryBatchController {
  constructor(
    @inject(TOKENS.INVENTORY_BATCH_SERVICE)
    private inventoryBatchService: IInventoryBatchService,
    @inject(TOKENS.PRODUCT_SERVICE)
    private productService: IProductService,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params as { productId: string };
      const batchNumber: string =
        await this.inventoryBatchService.generateBatchNumber(productId);

      const requestData = CreateInventoryBatchSchema.parse(req.body);

      const { quantity, price, expiryDate } = requestData;

      const inventoryBatch = await this.inventoryBatchService.create({
        batchNumber,
        quantity,
        price,
        expiryDate,
        productId,
      });

      const response: ApiResponse<InventoryBatchBase> = {
        success: true,
        data: inventoryBatch,
        message: "Inventory batch created successfully",
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const requestData = UpdateInventoryBatchSchema.parse(req.body);

      const { quantity, price, expiryDate } = requestData;

      const inventoryBatch = await this.inventoryBatchService.update(id, {
        quantity,
        price,
        expiryDate,
      });
      const response: ApiResponse<InventoryBatchBase | null> = {
        success: true,
        data: inventoryBatch,
        message: "Inventory batch updated successfully",
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const deleteInventory = await this.inventoryBatchService.delete(id);

      const response: ApiResponse<boolean> = {
        success: true,
        data: deleteInventory,
        message: deleteInventory
          ? "Inventory batch deleted successfully"
          : "Inventory batch cannot be deleted",
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params as { productId: string };
      console.log("productId", productId);
      const inventoryBatches =
        await this.inventoryBatchService.getInventoryByProductId(productId);

      console.log("inventory batchs", inventoryBatches);

      const response: ApiResponse<InventoryBatchResponse[]> = {
        success: true,
        data: inventoryBatches,
        message: "Inventory batches retrieved successfully",
      };

      res.status(200).json(response);
      return;
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {};
}

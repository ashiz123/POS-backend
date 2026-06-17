import { Document, Model, UpdateQuery } from "mongoose";
import { logger } from "../middlewares/logHandler";

export interface ICrudRepository<T, CreateDTO, UpdateDTO> {
  create(data: CreateDTO): Promise<T>;
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  update(id: string, data: UpdateQuery<UpdateDTO>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

export abstract class CrudRepository<
  T extends Document,
  CreateDTO,
  UpdateDTO,
> implements ICrudRepository<T, CreateDTO, UpdateDTO> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: CreateDTO): Promise<T> {
    return this.model.create(data);
  }

  async findAll(): Promise<T[]> {
    return this.model.find({ deletedAt: null });
  }

  async findById(id: string): Promise<T | null> {
    // return this.model.findOne({ _id: id, deletedAt: null });
    return this.model
      .findOne({ _id: id, deletedAt: null })
      .lean() as Promise<T | null>;
  }

  async update(id: string, data: UpdateQuery<UpdateDTO>): Promise<T | null> {
    return this.model.findByIdAndUpdate(
      { _id: id, deletedAt: null },
      data as UpdateQuery<T>,
      { new: true },
    );
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndUpdate(
      id,
      {
        deletedAt: new Date(),
      } as UpdateQuery<T>,
      { new: true }, //return new doc rather than old one
    );
    return !!result;
  }
}

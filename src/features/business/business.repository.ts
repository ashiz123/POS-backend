import { injectable } from "tsyringe";
import { ClientSession } from "mongoose";
import { CrudRepository } from "../../shared/crudRepository";
import { CreateBusinessDTO, UpdateBusinessDTO } from "./business.model";
import { BusinessModel, IBusinessDocument } from "./database/business_db_model";
import { IBusinessRepository } from "./business.type";
import { NotFoundError } from "../../errors/httpErrors";

//interface

//class
@injectable()
export class BusinessRepository
  extends CrudRepository<
    IBusinessDocument,
    CreateBusinessDTO,
    UpdateBusinessDTO
  >
  implements IBusinessRepository
{
  constructor() {
    super(BusinessModel);
  }

  async filterByUserId(userId: string): Promise<IBusinessDocument[]> {
    return this.model.find({ userId });
  }

  async filterByName(name: string): Promise<IBusinessDocument | null> {
    return this.model.findOne({ name: { $regex: name, $options: "i" } });
  }

  async createWithSession(
    data: CreateBusinessDTO,
    session: ClientSession,
  ): Promise<IBusinessDocument> {
    console.log(data);
    const [business] = await this.model.create([data], { session });
    return business;
  }

  async findAndUpdateByToken(
    token: string,
    session: ClientSession,
  ): Promise<IBusinessDocument | null> {
    return await this.model.findOneAndUpdate(
      { activationToken: token },
      {
        status: "active",
        $unset: { activationToken: "" },
      },
      { new: true, session }, //return updated doc
    );
  }

  async getBusinessStatus(businessId: string): Promise<string> {
    const business = await this.model
      .findOne({ _id: businessId })
      .select("status")
      .lean() // Returns plain object
      .exec();

    if (!business) {
      throw new NotFoundError(`Business ${businessId} not found`);
    }

    return business.status;
  }
}

export const businessRepository = new BusinessRepository();

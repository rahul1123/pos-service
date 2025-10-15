import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from '../db/db.service';
import { UtilService } from '../util/util.service';
import { CreateAccountDto ,UpdateAccountDto} from './account.dto'; // ✅ Define DTOs
@Injectable()
export class AccountService {
  constructor(
    private readonly dbService: DbService,
    public utilService: UtilService,
  ) {}
  //Get All Accounts
  async findAll() {
    try {
      const query = `SELECT * FROM accounts ORDER BY updated_at DESC`;
      const list = await this.dbService.execute(query);
    return this.utilService.successResponse(
      list.length > 0 ? list : [],
      'get All Accounts Successfully.'
    );
    } catch (error) {
      console.error('Error fetching Accounts:', error);
      throw new InternalServerErrorException('Failed to fetch Accounts');
    }
  }

  //Get Lead By ID
  async findOne(id: number) {
    try {
      const query = 'SELECT * FROM accounts  WHERE id = $1';
      const result = await this.dbService.executeQuery(query, [id]);
      if (result.length === 0) {
        throw new NotFoundException(`Accounts with ID ${id} not found`);
      }

       return this.utilService.successResponse(
     result[0],
      'get   Accounts By Id Successfully.'
    );
 
    } catch (error) {
      console.error(`Error fetching Accounts  with ID ${id}:`, error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to fetch Accounts ');
    }
  }

  //Add lead function
  async create(dto: CreateAccountDto) {
    try {
      const query = `
        INSERT INTO accounts  (
         owner_id,
         name,
         industry,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING *;
      `;
      const values = [
        dto.name,
        dto.industry,
      ];

      const result = await this.dbService.executeQuery(query, values);
      return this.utilService.successResponse(result[0], 'Accounts created successfully');
    } catch (error) {
      console.error('Error creating reseller:', error);
      throw new InternalServerErrorException('Failed to create Accounts');
    }
  }

  //Update Leads
  async update(id: number, dto: UpdateAccountDto) {
    try {
      const query = `
        UPDATE users  SET
          name = $1,
          company = $2,
          status = $3,
          updated_at = NOW()
        WHERE id = $4
        RETURNING *;
      `;
      const values = [
        dto.name,
        dto.industry,
        id,
      ];

      const result = await this.dbService.executeQuery(query, values);

      if (result.length === 0) {
        throw new NotFoundException(`Accounts with ID ${id} not found`);
      }

      return this.utilService.successResponse(result[0], 'Accounts updated successfully');
    } catch (error) {
      console.error(`Error updating Accounts with ID ${id}:`, error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to update Accounts');
    }
  }

  // 📌 Delete Reseller
  async remove(id: number) {
    try {
      const query = 'DELETE FROM accounts  WHERE id = $1 RETURNING *';
      const result = await this.dbService.executeQuery(query, [id]);

      if (result.length === 0) {
        throw new NotFoundException(`Accounts with ID ${id} not found`);
      }

      return this.utilService.successResponse(
        `Accounts with ID ${id} deleted successfully`,
      );
    } catch (error) {
      console.error(`Error deleting Accounts with ID ${id}:`, error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to delete Accounts');
    }
  }

   async findActivities(accountId: string, id: string) {
    try {
      const query = 'SELECT * FROM activities  WHERE account_id = $1';
      const result = await this.dbService.executeQuery(query, [accountId]);
      if (result.length === 0) {
        throw new NotFoundException(`Accounts account activity with ID ${id} not found`);
      }

       return this.utilService.successResponse(
     result,
      'get Activities by   Accounts By Id Successfully.'
    );
 
    } catch (error) {
      console.error(`Error fetching account activity  with ID ${id}:`, error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to fetch Accounts ');
    }
  }
}
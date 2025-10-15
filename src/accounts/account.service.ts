import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from '../db/db.service';
import { UtilService } from '../util/util.service';
import { CreateAccountDto ,UpdateAccountDto,CreateActivityDto,UpdateActivityDto} from './account.dto'; // ✅ Define DTOs
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
async findOne(id: string) {
  try {
    const query = `
      SELECT 
        a.*, 
        COUNT(act.id) AS activity_count
      FROM accounts a
      LEFT JOIN activities act ON act.user_id = a.id
      WHERE a.id = $1
      GROUP BY a.id;
    `;

    const result = await this.dbService.executeQuery(query, [id]);

    if (result.length === 0) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }

    return this.utilService.successResponse(
      result[0],
      'Fetched account with activity count successfully.'
    );

  } catch (error) {
    console.error(`Error fetching account with ID ${id}:`, error);
    throw error instanceof NotFoundException
      ? error
      : new InternalServerErrorException('Failed to fetch account');
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
        UPDATE accounts SET
          name = $1,
          industry = $2,
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

  // 
  async remove(id: string) {
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

  async createActivity(accountId: string, dto: CreateActivityDto) {
     const newId = await this.generateNextActivityId();
    const query = `
      INSERT INTO activities (id,account_id, user_id, type, notes, next_follow_up)
      VALUES ($1, $2, $3, $4, $5,$6)
      RETURNING *;
    `;
    const values = [newId ,accountId, dto.user_id, dto.type, dto.notes, dto.next_follow_up];
    const result = await this.dbService.executeQuery(query, values);
    return this.utilService.successResponse(result[0], 'Activity created successfully.');
  }

  // ✅ Update activity
  async updateActivity(accountId: string, id: string, dto: UpdateActivityDto) {
    const query = `
      UPDATE activities
      SET type = COALESCE($1, type),
          notes = COALESCE($2, notes),
          next_follow_up = COALESCE($3, next_follow_up)
      WHERE id = $4 AND account_id = $5
      RETURNING *;
    `;
    const result = await this.dbService.executeQuery(query, [
      dto.type,
      dto.notes,
      dto.next_follow_up,
      id,
      accountId,
    ]);

    if (result.length === 0) throw new NotFoundException('Activity not found.');
    return this.utilService.successResponse(result[0], 'Activity updated successfully.');
  }

  // ✅ Delete activity
  async deleteActivity(accountId: string, id: string) {
    const query = `DELETE FROM activities WHERE id = $1 AND account_id = $2 RETURNING *;`;
    const result = await this.dbService.executeQuery(query, [id, accountId]);

    if (result.length === 0) throw new NotFoundException('Activity not found.');
    return this.utilService.successResponse(result[0], 'Activity deleted successfully.');
  }


  //create code for next activity is for primary key 

  async generateNextActivityId(): Promise<string> {
    // Get the last activity ID (like 'act4')
    const result = await this.dbService.executeQuery(
      `SELECT id FROM activities ORDER BY created_at DESC LIMIT 1`
    );

    if (result.length === 0) {
      return 'act1'; // first record
    }

    const lastId = result[0].id; // e.g., 'act4'
    const lastNumber = parseInt(lastId.replace('act', ''), 10) || 0;
    const nextNumber = lastNumber + 1;

    return `act${nextNumber}`;
  }
}
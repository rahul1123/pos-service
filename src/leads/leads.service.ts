import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from '../db/db.service';
import { UtilService } from '../util/util.service';
import { CreateResellerDto ,UpdateResellerDto} from './leads.dto'; // ✅ Define DTOs
@Injectable()
export class LeadService {
  constructor(
    private readonly dbService: DbService,
    public utilService: UtilService,
  ) {}
  //Get All Leads
  async findAll() {
    try {
      const query = `SELECT * FROM leads ORDER BY updated_at DESC`;
      const list = await this.dbService.execute(query);
    return this.utilService.successResponse(
      list.length > 0 ? list : [],
      'get All Leads Successfully.'
    );
    } catch (error) {
      console.error('Error fetching Leads:', error);
      throw new InternalServerErrorException('Failed to fetch leads');
    }
  }

  //Get Lead By ID
  async findOne(id: number) {
    try {
      const query = 'SELECT * FROM leads  WHERE id = $1';
      const result = await this.dbService.executeQuery(query, [id]);
      if (result.length === 0) {
        throw new NotFoundException(`Leads with ID ${id} not found`);
      }
      return result[0];
    } catch (error) {
      console.error(`Error fetching Leads  with ID ${id}:`, error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to fetch Leads ');
    }
  }

  //Add lead function
  async create(dto: CreateResellerDto) {
    try {
      const query = `
        INSERT INTO leads  (
          name,
          company,
          status,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING *;
      `;
      const values = [
        dto.name,
        dto.company,
        dto.status,
      ];

      const result = await this.dbService.executeQuery(query, values);
      return this.utilService.successResponse(result[0], 'Reseller created successfully');
    } catch (error) {
      console.error('Error creating reseller:', error);
      throw new InternalServerErrorException('Failed to create reseller');
    }
  }

  //Update Leads
  async update(id: number, dto: UpdateResellerDto) {
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
        dto.company,
        dto.status,
        id,
      ];

      const result = await this.dbService.executeQuery(query, values);

      if (result.length === 0) {
        throw new NotFoundException(`Reseller with ID ${id} not found`);
      }

      return this.utilService.successResponse(result[0], 'Reseller updated successfully');
    } catch (error) {
      console.error(`Error updating reseller with ID ${id}:`, error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to update reseller');
    }
  }

  // 📌 Delete Reseller
  async remove(id: number) {
    try {
      const query = 'DELETE FROM users  WHERE id = $1 RETURNING *';
      const result = await this.dbService.executeQuery(query, [id]);

      if (result.length === 0) {
        throw new NotFoundException(`Reseller with ID ${id} not found`);
      }

      return this.utilService.successResponse(
        `Reseller with ID ${id} deleted successfully`,
      );
    } catch (error) {
      console.error(`Error deleting reseller with ID ${id}:`, error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to delete reseller');
    }
  }

  // 📌 Bulk Delete Resellers
  async bulkDelete(ids: number[]) {
    try {
      const query = `DELETE FROM users  WHERE id = ANY($1::int[]) RETURNING id`;
      const result = await this.dbService.executeQuery(query, [ids]);

      return this.utilService.successResponse(
        result,
        `${result.length} reseller(s) deleted successfully`,
      );
    } catch (error) {
      console.error('Error during bulk delete:', error);
      throw new InternalServerErrorException('Failed to bulk delete resellers');
    }
  }
}

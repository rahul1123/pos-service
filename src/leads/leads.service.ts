import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DbService } from '../db/db.service';
import { UtilService } from '../util/util.service';
import { CreateLeadDto ,UpdateLeadDto,FilterLeadsDto} from './leads.dto'; 
@Injectable()
export class LeadService {
  constructor(
    private readonly dbService: DbService,
    public utilService: UtilService,
  ) { }
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
  async findOne(id: string) {
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
async create(dto: CreateLeadDto) {
  try {
    // Step 1: Get last lead ID
    const lastIdResult = await this.dbService.executeQuery(
      'SELECT id FROM leads ORDER BY id DESC LIMIT 1'
    );
    let nextId: string;

    if (lastIdResult.length > 0) {
      const lastId = lastIdResult[0].id;
      const match = lastId.match(/^([A-Za-z]+)(\d+)$/);

      if (match) {
        const prefix = match[1]; // e.g., "l"
        const number = parseInt(match[2], 10) + 1;
        nextId = `${prefix}${number}`; // → "l2"
      } else {
        // fallback if last ID format is unexpected
        nextId = 'l1';
      }
    } else {
      // No leads yet, start from l1
      nextId = 'l1';
    }

    // Step 2: Insert new lead with generated ID
    const query = `
      INSERT INTO leads (
        id,
        name,
        company,
        owner_id,
        status,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4,$5, NOW(), NOW())
      RETURNING *;
    `;

    const values = [
      nextId,
      dto.name,
      dto.company,
      dto.owner_id,
      dto.status,
    ];

    const result = await this.dbService.executeQuery(query, values);

    return this.utilService.successResponse(result[0], 'Lead created successfully');
  } catch (error) {
    console.error('Error creating lead:', error);
    throw new InternalServerErrorException('Failed to create lead');
  }
}

  //Update Leads
  async update(id: number, dto: UpdateLeadDto) {
    try {
      const query = `
        UPDATE leads  SET
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
        throw new NotFoundException(`Lead with ID ${id} not found`);
      }

      return this.utilService.successResponse(result[0], 'Lead updated successfully');
    } catch (error) {
      console.error(`Error updating reseller with ID ${id}:`, error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to update Lead');
    }
  }

  // 📌 Delete Reseller
  async remove(id: String) {
    try {
      const query = 'DELETE FROM leads  WHERE id = $1 RETURNING *';
      const result = await this.dbService.executeQuery(query, [id]);

      if (result.length === 0) {
        throw new NotFoundException(`Lead with ID ${id} not found`);
      }

      return this.utilService.successResponse(
        `Lead with ID ${id} deleted successfully`,
      );
    } catch (error) {
      console.error(`Error deleting reseller with ID ${id}:`, error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to delete Lead');
    }
  }



  async convertLead(id: string) {
    try {
      // Step 1: Get lead details
      const lead = await this.findOne(id);
      // Step 2: Prepare data for account creation
      const lastIdResult = await this.dbService.executeQuery(
        'SELECT id FROM accounts ORDER BY id DESC LIMIT 1'
      );
      let nextId;
      //write this code for maintain the primary key of combination of charectr and integer
      if (lastIdResult.length > 0) {
        const lastId = lastIdResult[0].id;
        // Extract prefix and numeric part — works for "l1", "L001", "ACC10", etc.
        const match = lastId.match(/^([A-Za-z]+)(\d+)$/);

        if (match) {
          const prefix = match[1]; // "l"
          const number = parseInt(match[2], 10) + 1; // 1 → 2
          nextId = 'a'+`${number}`; // → "l2"
        }
      }
       else {
         nextId = `a1`; // → "l2"
        }
      const accountPayload = {
        id: nextId,
        name: lead.name,
        owner_id: lead.owner_id,
        industry: lead.industry || null,
        created_at: new Date(),
      };
      // Step 3: Insert into accounts table
      const insertQuery = `
        INSERT INTO accounts (id,name, owner_id,industry, created_at)
        VALUES ($1, $2, $3, $4,$5)
        RETURNING *;
      `;
      const accountResult = await this.dbService.executeQuery(insertQuery, [
        accountPayload.id,
        accountPayload.name,
        accountPayload.owner_id,
        accountPayload.industry,
        accountPayload.created_at,
      ]);
      return accountResult[0];
    } catch (error) {
      console.error(`Error converting lead with ID ${id}:`, error);
      throw new InternalServerErrorException('Failed to convert lead');
    }
  }

  //filterLeads

  async filterLeads(filter: FilterLeadsDto) {
    let query = `SELECT * FROM leads WHERE 1=1`;
     const params: (string | number)[] = [];

    if (filter.status) {
      params.push(filter.status);
      query += ` AND status = $${params.length}`;
    }

    // if (filter.createdFrom) {
    //   params.push(filter.createdFrom);
    //   query += ` AND created_at >= $${params.length}`;
    // }

    // if (filter.createdTo) {
    //   params.push(filter.createdTo);
    //   query += ` AND created_at <= $${params.length}`;
    // }

    query += ` ORDER BY created_at DESC`;

    return  this.dbService.executeQuery(query, params);
  }
}

import { forwardRef, Inject, Injectable, ServiceUnavailableException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { DbService } from "../db/db.service";
import { UtilService } from "../util/util.service";
import { AuthService } from "../auth/auth.service"
const bcrypt = require("bcryptjs");
import * as jwt from 'jsonwebtoken';
import { UpdateUserDto } from './user.dto';
import { ConfigService } from "@nestjs/config";

@Injectable()
export class UserService {
  constructor(private readonly configService: ConfigService,
    public dbService: DbService,
    public utilService: UtilService,
    @Inject(forwardRef(() => AuthService)) public AuthService: AuthService
    
  ) {
  }
  //get All userlist from the table 
  async getAllUsers() {
    const query = `SELECT * FROM "users" ORDER BY id Desc;`;
    const result = await this.dbService.execute(query);
    return this.utilService.successResponse(result, "User list retrieved successfully.");
    //return users;
  }
  async getUserById(id: number): Promise<any> {
    const query = `SELECT * FROM "users" WHERE id='${id}'`;
    const result = await this.dbService.execute(query);
    return this.utilService.successResponse(result[0], "User details retrieved successfully.");

  }
  async deleteUserById(id: number) {
    const query = `DELETE FROM "users" WHERE id='${id}' RETURNING *;`;
    const result = await this.dbService.execute(query);
    if (result.length === 0) {
      return this.utilService.failResponse(null, "User not found or already deleted.");
    }
    return this.utilService.successResponse(result[0], "User deleted successfully.");
  }
  async checkAdminUser(email: string, password: string) {
    try {
      // Only query by email
      const users: any[] = await this.dbService.execute(
        `SELECT * FROM users WHERE email = '${email}'`,
      );
      console.log(users, 'users', `SELECT * FROM users WHERE email = '${email}'`)
      if (users.length === 0) {
        return null; // User not found
      }
      const user = users[0];
      // Compare input password with hashed password from DB
      const passMatch = await bcrypt.compare(password, user.password);
      if (!passMatch) {
        return null; // Password doesn't match
      }
      // Optionally remove password before returning
      delete user.password;

      return user;

    } catch (error) {
      console.error("Admin Login Error:", error);
      return null;
    }
  }

  async registerGoogleAuth(profile: any) {
    const { id: googleId, emails, displayName, photos } = profile;
    const email = emails[0].value;

    const nameParts = displayName.split(' ');
    const lastName = nameParts.slice(1).join(' ');

    let existingUser = await this.dbService.execute(
      `SELECT * FROM users WHERE email='${email}'`
    );
    if (existingUser.length === 0) {
      return this.utilService.failResponse("No such user exists");
    }
    if (existingUser.length > 0) {
      if (!existingUser[0].google_id) {
        await this.dbService.execute(
          `ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255)`
        );
        await this.dbService.execute(
          `UPDATE users SET google_id='${googleId}' WHERE id=${existingUser[0].id}`
        );
        return existingUser[0];
      }
      return {
        id: existingUser[0].insertId,
        last_name: lastName,
        email,
        google_id: googleId,
        type: existingUser[0].department,
        designation: existingUser[0].designation
      };
    }
  }

  async bulkDeleteCandidates(id: number | number[]) {
    try {
      // Prepare the condition
      let condition = '';
      if (Array.isArray(id)) {
        if (id.length === 0) {
          return this.utilService.failResponse(null, "No IDs provided.");
        }
        const idList = id.map(Number).join(','); // Ensures all are numbers
        condition = `id IN (${idList})`;
      } else {
        condition = `id = ${Number(id)}`;
      }

      const query = `DELETE FROM "users" WHERE ${condition} RETURNING *;`;
      const result = await this.dbService.execute(query);

      if (result.length === 0) {
        return this.utilService.failResponse(null, "User(s) not found or already deleted.");
      }

      return this.utilService.successResponse(result, "User(s) deleted successfully.");
    } catch (error) {
      console.error('Delete jobs Error:', error);
      throw new Error(error.message || error);
    }
  }

  async bulkUpdateUser(
    ids: number[],
    updates: { field: string; action: string; value: any }[],
  ) {
    try {
      type BulkUpdateResult = {
        id: number;
        updated: boolean;
        message?: string;
        error?: string;
      };

      const updatedResults: BulkUpdateResult[] = [];

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return this.utilService.failResponse('No candidate IDs provided.');
      }

      if (!updates || !Array.isArray(updates) || updates.length === 0) {
        return this.utilService.failResponse('No update fields provided.');
      }

      const setData = updates
        .filter(u => u.action === 'change_to') // Only process 'change_to' actions
        .map(u => `${u.field}='${u.value}'`);

      for (const id of ids) {
        try {
          const where = [`id=${id}`];
          const result = await this.dbService.updateData('users', setData, where);

          if (result.affectedRows === 0) {
            updatedResults.push({ id, updated: false, message: 'No record updated' });
          } else {
            updatedResults.push({ id, updated: true });
          }
        } catch (error) {
          updatedResults.push({ id, updated: false, error: error.message });
        }
      }
      return this.utilService.successResponse(updatedResults, 'User Bulk Updation has been Done .');
    } catch (err) {
      console.error('Bulk update failed:', err);
      return this.utilService.failResponse('An error occurred during bulk update.');
    }
  }
  async updateUser(id: number, body: Partial<UpdateUserDto>) {
    try {
      const existingUser = await this.dbService.findOne('users', { id });
      if (!existingUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      try {
     
       
        
      } catch (error) {
        console.error(`Failed to update Cognito user ${body.email}:`, error);

        // You can either throw an error for NestJS to catch
        throw new Error(`Cognito update failed: ${error.message || error}`);
      }

      const updatedUser = await this.dbService.update('users', id, body);

      return this.utilService.successResponse(
        `User with ID ${id} updated successfully`,
        updatedUser,
      );
    } catch (error) {
      console.error(`Update issue for user ${id}:`, error.message);
      // Handle DB timeout
      if (error.code === 'ETIMEDOUT' || error.message.includes('ETIMEDOUT')) {
        throw new ServiceUnavailableException(
          'Database connection timed out. Please try again later.',
        );
      }

      throw new InternalServerErrorException('Failed to update user');
    }
  }
}



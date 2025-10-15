import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Res,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody
} from '@nestjs/swagger';
import { AccountService } from './account.service'; // ✅ Update your path accordingly
import { CreateAccountDto,UpdateAccountDto,CreateActivityDto,UpdateActivityDto} from './account.dto'; // ✅ Define DTOs
@ApiTags('account')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}
  @Get()
  @ApiOperation({ summary: 'Get all accounts' })
  async getAll(@Res() res: Response) {
    try {
      const resellers = await this.accountService.findAll();
      return res.status(HttpStatus.OK).json(resellers);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to fetch accounts');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get accounts by ID' })
  @ApiParam({ name: 'id', type: String })
  async getOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const reseller = await this.accountService.findOne(id);
      return res.status(HttpStatus.OK).json(reseller);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to fetch accounts');
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new accounts' })
  @ApiBody({ type: CreateAccountDto })
  async create(@Body() payload: CreateAccountDto, @Res() res: Response) {
    try {
      const newReseller = await this.accountService.create(payload);
      return res.status(HttpStatus.CREATED).json(newReseller);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to create accounts');
    }
  } 

  @Put(':id')
  @ApiOperation({ summary: 'Update a accounts by ID' })
  @ApiBody({ type: UpdateAccountDto })
  @ApiParam({ name: 'id', type: Number })
  async update(
    @Param('id') id: number,
    @Body() payload: UpdateAccountDto,
    @Res() res: Response,
  ) {
    try {
      const updated = await this.accountService.update(id, payload);
      return res.status(HttpStatus.OK).json(updated);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to update Account');
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a accounts by ID' })
  @ApiParam({ name: 'id', type: String })
  async delete(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.accountService.remove(id);
      return res
        .status(HttpStatus.OK)
        .json({ message: 'accounts deleted successfully' });
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to delete accounts');
    }
  }

  // get all account Activity
  @Get('/:accountId/activities')
  @ApiOperation({ summary: 'Get activity by account Id under account' })
  async findOne(
    @Param('accountId') accountId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const activity = await this.accountService.findActivities(accountId, id);
      return res.status(HttpStatus.OK).json(activity);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to fetch activity');
    }
  }


  ///Create activites under account
  @Post('/:accountId/activities')
  @ApiOperation({ summary: 'Create a new activity for an account' })
   @ApiBody({ type:CreateActivityDto })
  async createActivity(
    @Param('accountId') accountId: string,
    @Body() createActivityDto: CreateActivityDto,
    @Res() res: Response,
  ) {
    try {
      const activity = await this.accountService.createActivity(accountId, createActivityDto);
      return res.status(HttpStatus.CREATED).json(activity);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to create activity');
    }
  }


  ///update activities of the  account

   @Put('/:accountId/activities/:id')
  @ApiOperation({ summary: 'Update activity under account' })
  @ApiBody({ type:UpdateActivityDto })
  async updateActivity(
    @Param('accountId') accountId: string,
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.accountService.updateActivity(accountId, id, updateActivityDto);
      return res.status(HttpStatus.OK).json(result);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to update activity');
    }
  }

  @Delete('/:accountId/activities/:id')
  @ApiOperation({ summary: 'Delete activity under account' })
  async deleteActivity(
    @Param('accountId') accountId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.accountService.deleteActivity(accountId, id);
      return res.status(HttpStatus.OK).json(result);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to delete activity');
    }
  }

  // delete activitas code 


 
}

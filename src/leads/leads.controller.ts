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
} from '@nestjs/swagger';
import { LeadService } from './leads.service'; // ✅ Update your path accordingly
import { CreateResellerDto ,UpdateResellerDto} from './leads.dto'; // ✅ Define DTOs
@ApiTags('leads')
@Controller('leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}
  @Get()
  @ApiOperation({ summary: 'Get all leads' })
  async getAll(@Res() res: Response) {
    try {
      const resellers = await this.leadService.findAll();
      return res.status(HttpStatus.OK).json(resellers);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to fetch leads');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get leads by ID' })
  @ApiParam({ name: 'id', type: Number })
  async getOne(@Param('id') id: number, @Res() res: Response) {
    try {
      const reseller = await this.leadService.findOne(id);
      return res.status(HttpStatus.OK).json(reseller);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to fetch reseller');
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new leads' })
  async create(@Body() payload: CreateResellerDto, @Res() res: Response) {
    try {
      const newReseller = await this.leadService.create(payload);
      return res.status(HttpStatus.CREATED).json(newReseller);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to create leads');
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a leads by ID' })
  @ApiParam({ name: 'id', type: Number })
  async update(
    @Param('id') id: number,
    @Body() payload: UpdateResellerDto,
    @Res() res: Response,
  ) {
    try {
      const updated = await this.leadService.update(id, payload);
      return res.status(HttpStatus.OK).json(updated);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to update leads');
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a leads by ID' })
  @ApiParam({ name: 'id', type: Number })
  async delete(@Param('id') id: number, @Res() res: Response) {
    try {
      await this.leadService.remove(id);
      return res
        .status(HttpStatus.OK)
        .json({ message: 'leads deleted successfully' });
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Failed to delete leads');
    }
  }
 
}

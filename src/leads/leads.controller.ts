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
import { LeadService } from './leads.service'; // ✅ Update your path accordingly
import { CreateLeadDto ,UpdateLeadDto,LeadSwaggerDto,FilterLeadsDto} from './leads.dto'; // ✅ Define DTOs
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
  @ApiParam({ name: 'id', type: String })
  async getOne(@Param('id') id: string, @Res() res: Response) {
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
  @ApiBody({ type: LeadSwaggerDto })
  
  async create(@Body() payload: CreateLeadDto, @Res() res: Response) {
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
  @ApiBody({ type: UpdateLeadDto })
  @ApiParam({ name: 'id', type: String })
  async update(
    @Param('id') id: number,
    @Body() payload: UpdateLeadDto,
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
  @ApiParam({ name: 'id', type: String })
  async delete(@Param('id') id: String, @Res() res: Response) {
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
  @Post(':id/convert')
  @ApiOperation({ summary: 'Convert a lead into an account' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 201, description: 'Lead converted successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async convertLead(@Param('id') id: string, @Res() res: Response) {
    try {

      const account = await this.leadService.convertLead(id);
      return res.status(HttpStatus.CREATED).json({
        message: 'Lead converted successfully',
        account,
      });
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Lead conversion failed');
    }
  }

  //filter leads by  user input 
    @Post('filter')
  @ApiOperation({ summary: 'Filter leads by status and created date range' })
  @ApiBody({ type: FilterLeadsDto })
  async filter(@Body() filterDto: FilterLeadsDto) {
    return this.leadService.filterLeads(filterDto);
  }
 
}

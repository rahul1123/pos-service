import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Delete,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { UpdateUserDto } from './user.dto';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  LoginAdminDto,
  RegisterDto,
  BulkDeleteCandidateDto,
  BulkUpdateCandidateDto
} from "./user.dto";
@ApiTags("user")
@Controller("user")
export class UserController {
  constructor(
    public service: UserService,
  ) {}

   
}

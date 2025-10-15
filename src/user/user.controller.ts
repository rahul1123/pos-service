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

@Post("login")
@ApiOperation({ summary: "Admin login" })
@ApiBody({ type: LoginAdminDto })
@ApiResponse({ status: 200, description: "Admin successfully logged in" })
@ApiResponse({ status: 401, description: "Invalid email or password" })
async loginAdmin(@Body() body: LoginAdminDto, @Res() res: Response) {
  const data = await this.service.loginAdmin(body);
  if (data) {
    return res.status(HttpStatus.OK).json({ message: data });
  } else {
    return res.status(HttpStatus.UNAUTHORIZED).json({ message: data });
  }
}
 @Post("register")
  @ApiOperation({
    summary: 'Register a new user',
    description: 'This endpoint registers a new user into the system.',
  })
  @ApiBody({
    description: 'Request body to register a new user',
    type: RegisterDto,
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', example: 'jwt.token.here' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'User Name' },
            email: { type: 'string', example: 'user@example.com' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Invalid email or password' },
      },
    },
  })
  async register(@Body() body, @Res() res: Response) {
    let data = await this.service.register(body);
    res.status(HttpStatus.OK).json(data);
  }






  @Post()
  @ApiOperation({ summary: "Create a new user" })
  @ApiBody({ type: CreateCustomerDto })
  async createUser(@Body() body: CreateCustomerDto, @Res() res: Response) {
    // const user = await this.service.createUser(body);
    res.status(HttpStatus.CREATED).json({ message: "User created" });
  }

  @Get("getAllUsers")
  @ApiOperation({ summary: "Get all users" })
  async getAllUsers(@Res() res: Response) {
    const users = await this.service.getAllUsers();
    res.status(HttpStatus.OK).json(users);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  @ApiParam({ name: "id", type: Number })
  async getUserById(@Param("id") id: number, @Res() res: Response) {
   const result = await this.service.getUserById(id);
    res.status(HttpStatus.OK).json(result);
  }

 @Put(":id")
@ApiOperation({ summary: "Update a user" })
@ApiParam({ name: "id", type: Number })
@ApiBody({ type: UpdateUserDto })
async updateUser(
  @Param("id") id: number,
  @Body() body: UpdateUserDto,
  @Res() res: Response,
) {
  // Build a clean update payload
  const updatedPayload: Partial<UpdateUserDto> & { name?: string,first_name?:string,last_name?:string,status?:number} = {};
console.log(body)
  // Construct name if either first_name or last_name is sent
  if (body.name) {
    const parts = body.name.trim().split(" ");
    updatedPayload.first_name = parts[0] ?? "";
    updatedPayload.last_name = parts.slice(1).join(" ") || "";
    // updatedPayload.name = body.name.trim();
  }
  if (body.email) updatedPayload.email = body.email;
  if (body.phone) updatedPayload.phone = body.phone;
  if (body.role) updatedPayload.role = body.role;
  if (body.agency_id) updatedPayload.agency_id = body.agency_id;
   if ("status" in body && body.status !== undefined && body.status !== null) {
    const s = typeof body.status === "string" ? Number(body.status) : body.status;
    if (s === 0 || s === 1) updatedPayload.status = s;
  }
  // Pass only the filtered fields to service
  await this.service.updateUser(id, updatedPayload);
  return res
    .status(HttpStatus.OK)
    .json({ message: `User with id ${id} updated successfully` });
}

  @Delete(":id")
  @ApiOperation({ summary: "Delete a user" })
  @ApiParam({ name: "id", type: Number })
  async deleteUser(@Param("id") id: number, @Res() res: Response) {
    // await this.service.deleteUser(id);
    res.status(HttpStatus.OK).json({ message: `User with id ${id} deleted` });
  }

 

    //bulk Delete Candidate:
    @Post('bulk-delete')
    @ApiOperation({ summary: 'Bulk deletion of candidates' })
    @ApiBody({ type: BulkDeleteCandidateDto })
    async bulkDeleteCandidates(
      @Body() body: BulkDeleteCandidateDto,
      @Res() res: Response,
    ) {
      try {
        const result = await this.service.bulkDeleteCandidates(body.data.ids);
        return res.status(HttpStatus.OK).json(result);
      } catch (error) {
        console.error('Bulk delete error:', error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Failed to delete candidates',
          error: error.message,
        });
      }
    }

  //bulk update candidate
  @Post('bulk-update')
  @ApiOperation({ summary: 'Bulk update candidates' })
  @ApiBody({ type: BulkUpdateCandidateDto })
  async bulkUpdateCandidates(
    @Body() body: BulkUpdateCandidateDto,
    @Res() res: Response,
  ) {
    try {
      const result = await this.service.bulkUpdateUser(body.ids, body.updates);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      console.error('Bulk update error:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to update candidates',
        error: error.message,
      });
    }
  }

  // user-file-uploads
}

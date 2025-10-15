import { HttpStatus, Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { AuthService } from "src/auth/auth.service";

@Injectable()
export class ApiMiddleware implements NestMiddleware {
  private readonly excludedPaths: string[] = [
    "/user/upload",
    "/user/loginViaOTP",
    "/blog",
    "/package",
    "/common",
    "/career",
    "/store-manager",
    "/order",
    "/places"
  ];

  constructor( private authService: AuthService) {
  }
  use(req: Request, res: Response, next: NextFunction) {
    // const authHeader = req.headers["authorization"];
    // if (!["/user/loginAdmin", "/user/login", "/user/register", "/erplead/addErpLeadData", "/common/erpAdditionalData", "/erplead/erpProjectIdConsumer", "/erplead/generateToken", "/brance/getPackageQuotation", "/order/getUserPaymentInfo"].includes(req.originalUrl) && !this.excludedPaths.some(path => req.originalUrl.includes(path))) {
    //   if (authHeader && authHeader.startsWith("Bearer ")) {
    //     const token = authHeader.split(" ")[1];
    //     this.authService.verifyToken(token);
    //   } else {
    //     throw new UnauthorizedException("Token is missing or invalid");
    //   }
    // }
    // console.log('Middle ware Request...');
    if (req.method == "POST" || req.method == "PUT") {
      if (req.originalUrl == "/places/upload" ) {
        next();
      } else {
        next();
      }

    } else {
      next();
    }
  }
}

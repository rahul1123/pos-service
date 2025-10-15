// src/middleware/rate-limit.middleware.ts
import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  firstRequestTimestamp: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private requests = new Map<string, RateLimitRecord>();
  private readonly windowMs: number; // e.g., 60 seconds
  private readonly maxRequests: number;

  constructor(windowMs = 60000, maxRequests = 5) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    const record = this.requests.get(ip);

    if (!record) {
      // First request
      this.requests.set(ip, { count: 1, firstRequestTimestamp: now });
      return next();
    }

    if (now - record.firstRequestTimestamp < this.windowMs) {
      // Within window
      if (record.count >= this.maxRequests) {
        throw new HttpException(
          `Too many requests. Limit is ${this.maxRequests} per ${this.windowMs / 1000}s`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      record.count++;
      this.requests.set(ip, record);
      return next();
    }

    // Window expired, reset
    this.requests.set(ip, { count: 1, firstRequestTimestamp: now });
    return next();
  }
}

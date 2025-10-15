import { UtilService } from './util.service';

describe('UtilService', () => {
  let utilService: UtilService;

  beforeEach(() => {
    utilService = new UtilService();
  });

  describe('successResponse', () => {
    it('should return a formatted success response', () => {
      const data = { id: 1 };
      const message = 'Test successful';
      const result = utilService.successResponse(data, message);

      expect(result).toEqual({
        success: true,
        message: 'Test successful',
        data: { id: 1 },
      });
    });
  });

  describe('formatDate', () => {
    it('should format a date to YYYY-MM-DD', () => {
      const date = new Date('2025-10-15T12:34:56Z');
      const result = utilService.getDTYMDHMSDT();
      expect(result).toBe('2025-10-15');
    });
  });
});

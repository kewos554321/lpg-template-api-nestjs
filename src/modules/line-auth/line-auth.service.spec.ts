import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LineAuthService } from './line-auth.service';
import { Customer } from '@artifact/lpg-api-service';

describe('LineAuthService', () => {
  let service: LineAuthService;
  let customerRepository: Repository<Customer>;

  const mockCustomerRepository = {
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
    })),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        LINE_CHANNEL_ID: 'test_channel_id',
        LINE_CHANNEL_SECRET: 'test_channel_secret',
        LINE_REDIRECT_URI: 'http://localhost:3000/callback',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LineAuthService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: mockCustomerRepository,
        },
      ],
    }).compile();

    service = module.get<LineAuthService>(LineAuthService);
    customerRepository = module.get<Repository<Customer>>(getRepositoryToken(Customer));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate login URL', () => {
    const result = service.generateLoginUrl();
    expect(result).toHaveProperty('loginUrl');
    expect(result).toHaveProperty('state');
    expect(result.loginUrl).toContain('access.line.me');
    expect(result.loginUrl).toContain('test_channel_id');
  });

  it('should find customer by LINE ID', async () => {
    const mockCustomer = { customer_id: 123, line_user_id: 'test_line_id' };
    mockCustomerRepository.createQueryBuilder().getOne.mockResolvedValue(mockCustomer);

    const result = await service['findCustomerByLineId']('test_line_id');
    expect(result).toEqual(mockCustomer);
  });

  it('should return null when customer not found', async () => {
    mockCustomerRepository.createQueryBuilder().getOne.mockResolvedValue(null);

    const result = await service['findCustomerByLineId']('non_existent_id');
    expect(result).toBeNull();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RolesService } from './roles.service';
import { Role } from './schemas/role.schema';

const ROLES = [
  {
    id: 1,
    name: 'Admin',
    description: 'Administrator role with full access',
    permissions:
      'create_user,update_user,delete_user,view_reports,manage_roles',
  },
  {
    id: 2,
    name: 'Manager',
    description: 'Manager role with limited access',
    permissions: 'view_reports',
  },
  {
    id: 3,
    name: 'User',
    description: 'Regular user role with basic access',
    permissions: 'view_reports,update_user,delete_user',
  },
];

describe('RolesService', () => {
  let service: RolesService;
  let model: Model<Role>;

  const mockRoleModel = {
    find: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getModelToken(Role.name),
          useValue: mockRoleModel,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    model = module.get<Model<Role>>(getModelToken(Role.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of roles', async () => {
      const result = ROLES;
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(result),
      } as any);

      expect(await service.findAll()).toBe(result);
    });
  });

  describe('findById', () => {
    it('should return a single role', async () => {
      const result = ROLES[0];
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(result),
      } as any);

      expect(await service.findById('1')).toBe(result);
    });
  });
});

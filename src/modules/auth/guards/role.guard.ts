import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { ROLES_IDS } from '@/constants/roles.constant';
import RequestWithUser from '../interfaces/request-with-user.interface';

const RoleGuard = (roles: ROLES_IDS[]): Type<CanActivate> => {
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest<RequestWithUser>();
      const user = request.user;
      return user?.roles.some((role) => roles.includes(role as ROLES_IDS));
    }
  }

  return mixin(RoleGuardMixin);
};

export default RoleGuard;

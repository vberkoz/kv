import { AuthenticatedUser } from '@kv/shared';
import { ForbiddenError } from './errors';

export function checkPermission(user: AuthenticatedUser, requiredPermission: 'read' | 'write' | 'delete'): void {
  if (!user.permissions || user.permissions.length === 0) {
    return;
  }
  
  if (!user.permissions.includes(requiredPermission)) {
    throw new ForbiddenError(`API key does not have '${requiredPermission}' permission`);
  }
}

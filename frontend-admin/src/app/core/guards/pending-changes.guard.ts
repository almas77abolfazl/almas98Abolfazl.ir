import { CanDeactivateFn } from '@angular/router';
import { Observable, of } from 'rxjs';

export interface CanComponentDeactivate {
  canDeactivate: () => boolean | Observable<boolean> | Promise<boolean>;
}

export const pendingChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  if (!component || typeof component.canDeactivate !== 'function') {
    return true;
  }
  const result = component.canDeactivate();
  return result instanceof Observable || result instanceof Promise ? result : of(result);
};

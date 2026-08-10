import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ConfirmService } from '../../core/services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [],
})
export class ConfirmDialogComponent {
  constructor(public confirm: ConfirmService) {}
}

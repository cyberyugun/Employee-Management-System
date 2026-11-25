import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { EmployeeService } from '../../../core/services/employee.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './employee-detail.component.html',
  styleUrl: './employee-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly employeeService = inject(EmployeeService);
  private readonly notificationService = inject(NotificationService);

  private readonly username = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('username') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('username') ?? '' },
  );
  readonly employee = computed(() => this.employeeService.findByUsername(this.username()));

  goBack(): void {
    // List filters, sorting, and pagination live in a root-provided state service and remain intact.
    void this.router.navigate(['/app/employees']);
  }

  copyEmail(email: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(email).then(() => {
        this.notificationService.show('success', 'Email copied', 'The employee email address has been copied.');
      }).catch(() => {
        this.notificationService.show('info', 'Email address', email);
      });
    }
  }
}

import { ChangeDetectionStrategy, Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EMPLOYEE_GROUPS } from '../../../core/data/employee.seed';
import { Employee, EmployeeStatus } from '../../../core/models/employee.model';
import { EmployeeService } from '../../../core/services/employee.service';
import { NotificationService } from '../../../core/services/notification.service';

const noFutureDateValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (!control.value) return null;
  const selectedDate = new Date(String(control.value));
  return Number.isNaN(selectedDate.getTime()) || selectedDate.getTime() > Date.now() ? { futureDate: true } : null;
};

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly employeeService = inject(EmployeeService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly hostElement = inject(ElementRef<HTMLElement>);

  readonly maxBirthDate = this.toLocalDateTimeValue(new Date());
  readonly groups = EMPLOYEE_GROUPS;
  readonly groupSearch = signal('');
  readonly isGroupDropdownOpen = signal(false);
  readonly filteredGroups = computed(() => {
    const query = this.groupSearch().trim().toLocaleLowerCase();
    return this.groups.filter((group) => group.toLocaleLowerCase().includes(query));
  });

  readonly form = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+$/)]],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    birthDate: ['', [Validators.required, noFutureDateValidator]],
    basicSalary: [0, [Validators.required, Validators.min(1)]],
    status: ['Permanent' as EmployeeStatus, [Validators.required]],
    group: ['', [Validators.required]],
    description: ['', [Validators.required]],
  });

  toggleGroupDropdown(): void {
    this.isGroupDropdownOpen.update((isOpen) => !isOpen);
    if (!this.isGroupDropdownOpen()) this.groupSearch.set('');
  }

  selectGroup(group: string): void {
    this.form.controls.group.setValue(group);
    this.form.controls.group.markAsTouched();
    this.form.controls.group.markAsDirty();
    this.isGroupDropdownOpen.set(false);
    this.groupSearch.set('');
  }

  closeGroupDropdown(): void {
    this.isGroupDropdownOpen.set(false);
    this.groupSearch.set('');
  }

  @HostListener('document:click', ['$event'])
  closeGroupDropdownOnOutsideClick(event: MouseEvent): void {
    const target = event.target;
    if (target instanceof Node && !this.hostElement.nativeElement.contains(target)) {
      this.closeGroupDropdown();
    }
  }

  isInvalid(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  private toLocalDateTimeValue(date: Date): string {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return localDate.toISOString().slice(0, 16);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const username = value.username.trim().toLowerCase();
    if (this.employeeService.existsByUsername(username)) {
      this.form.controls.username.setErrors({ alreadyExists: true });
      this.form.controls.username.markAsTouched();
      return;
    }

    const employee: Employee = {
      id: crypto.randomUUID(),
      username,
      firstName: value.firstName.trim(),
      lastName: value.lastName.trim(),
      email: value.email.trim().toLowerCase(),
      birthDate: new Date(value.birthDate).toISOString(),
      basicSalary: Number(value.basicSalary),
      status: value.status,
      group: value.group,
      description: new Date(value.description).toISOString(),
    };

    this.employeeService.create(employee);
    this.notificationService.show('success', 'Employee added', `${employee.firstName} ${employee.lastName} has been added to the directory.`);
    void this.router.navigate(['/app/employees']);
  }
}

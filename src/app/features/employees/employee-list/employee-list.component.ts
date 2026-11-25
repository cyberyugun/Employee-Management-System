import { ChangeDetectionStrategy, Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Employee, EmployeeSortField } from '../../../core/models/employee.model';
import { EMPLOYEE_GROUPS } from '../../../core/data/employee.seed';
import { EmployeeService } from '../../../core/services/employee.service';
import { EmployeeListStateService } from '../../../core/services/employee-list-state.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeListComponent {
  private readonly employeeService = inject(EmployeeService);
  private readonly listStateService = inject(EmployeeListStateService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly hostElement = inject(ElementRef<HTMLElement>);

  readonly state = this.listStateService.state;
  readonly groups = EMPLOYEE_GROUPS;
  readonly groupSearch = signal('');
  readonly isGroupDropdownOpen = signal(false);
  readonly filteredGroups = computed(() => {
    const query = this.groupSearch().trim().toLocaleLowerCase();
    return this.groups.filter((group) => group.toLocaleLowerCase().includes(query));
  });
  readonly totalEmployees = computed(() => this.employeeService.employees().length);
  readonly activeEmployees = computed(() => this.employeeService.employees().filter((employee) => employee.status === 'Permanent').length);
  readonly groupCount = computed(() => new Set(this.employeeService.employees().map((employee) => employee.group)).size);

  readonly filteredEmployees = computed(() => {
    const employees = this.employeeService.employees();
    const { searchTerm, groupTerm, sortBy, sortDirection } = this.state();
    const nameQuery = searchTerm.trim().toLocaleLowerCase();
    const groupQuery = groupTerm.trim().toLocaleLowerCase();

    const filtered = employees.filter((employee) => {
      const searchableText = `${employee.username} ${employee.firstName} ${employee.lastName} ${employee.email}`.toLocaleLowerCase();
      const matchesName = !nameQuery || searchableText.includes(nameQuery);
      const matchesGroup = !groupQuery || employee.group.toLocaleLowerCase() === groupQuery;
      return matchesName && matchesGroup;
    });

    return [...filtered].sort((a, b) => {
      const left = a[sortBy];
      const right = b[sortBy];
      const comparison = typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left).localeCompare(String(right), 'id-ID', { sensitivity: 'base' });
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredEmployees().length / this.state().pageSize)));
  readonly visibleEmployees = computed(() => {
    const { page, pageSize } = this.state();
    const startIndex = (page - 1) * pageSize;
    return this.filteredEmployees().slice(startIndex, startIndex + pageSize);
  });
  readonly firstItem = computed(() => this.filteredEmployees().length === 0 ? 0 : (this.state().page - 1) * this.state().pageSize + 1);
  readonly lastItem = computed(() => Math.min(this.state().page * this.state().pageSize, this.filteredEmployees().length));

  onSearchChange(event: Event): void {
    this.listStateService.update({ searchTerm: (event.target as HTMLInputElement).value, page: 1 });
  }

  toggleGroupDropdown(): void {
    this.isGroupDropdownOpen.update((isOpen) => !isOpen);
    if (!this.isGroupDropdownOpen()) this.groupSearch.set('');
  }

  selectGroup(group: string): void {
    this.listStateService.update({ groupTerm: group, page: 1 });
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

  onPageSizeChange(event: Event): void {
    const pageSize = Number((event.target as HTMLSelectElement).value);
    this.listStateService.update({ pageSize, page: 1 });
  }

  sort(field: EmployeeSortField): void {
    const current = this.state();
    const sortDirection = current.sortBy === field && current.sortDirection === 'asc' ? 'desc' : 'asc';
    this.listStateService.update({ sortBy: field, sortDirection });
  }

  goToPage(page: number): void {
    this.listStateService.update({ page: Math.min(Math.max(page, 1), this.totalPages()) });
  }

  openDetail(employee: Employee): void {
    void this.router.navigate(['/app/employees', employee.username]);
  }

  addEmployee(): void {
    void this.router.navigate(['/app/employees/new']);
  }

  notifyEdit(employee: Employee): void {
    this.notificationService.show('warning', 'Edit action', `Edit action for ${employee.firstName} ${employee.lastName} is a demo action.`);
  }

  notifyDelete(employee: Employee): void {
    this.notificationService.show('danger', 'Delete action', `Delete action for ${employee.firstName} ${employee.lastName} is a demo action.`);
  }

  clearFilters(): void {
    this.listStateService.update({ searchTerm: '', groupTerm: '', page: 1 });
    this.closeGroupDropdown();
  }
}

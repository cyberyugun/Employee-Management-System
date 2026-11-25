import { Injectable, signal } from '@angular/core';
import { Employee } from '../models/employee.model';
import { createSeedEmployees } from '../data/employee.seed';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly storageKey = `${environment.storagePrefix}:employees`;
  private readonly employeeState = signal<Employee[]>(this.loadEmployees());
  readonly employees = this.employeeState.asReadonly();

  findByUsername(username: string): Employee | undefined {
    return this.employeeState().find((employee) => employee.username === username);
  }

  existsByUsername(username: string): boolean {
    const normalized = username.trim().toLowerCase();
    return this.employeeState().some((employee) => employee.username.toLowerCase() === normalized);
  }

  create(employee: Employee): void {
    this.employeeState.update((employees) => [employee, ...employees]);
    this.persistEmployees();
  }

  private loadEmployees(): Employee[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const storedValue = localStorage.getItem(this.storageKey);
        if (storedValue) {
          const parsed: unknown = JSON.parse(storedValue);
          if (Array.isArray(parsed)) {
            return parsed as Employee[];
          }
        }
      }
    } catch {
    }

    return createSeedEmployees(120);
  }

  private persistEmployees(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.employeeState()));
      }
    } catch {
    }
  }
}

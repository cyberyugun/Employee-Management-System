import { Injectable, signal } from '@angular/core';
import { EmployeeListState } from '../models/employee.model';

const INITIAL_STATE: EmployeeListState = {
  searchTerm: '',
  groupTerm: '',
  sortBy: 'username',
  sortDirection: 'asc',
  page: 1,
  pageSize: 10,
};

@Injectable({ providedIn: 'root' })
export class EmployeeListStateService {
  private readonly stateSignal = signal<EmployeeListState>({ ...INITIAL_STATE });
  readonly state = this.stateSignal.asReadonly();

  update(patch: Partial<EmployeeListState>): void {
    this.stateSignal.update((current) => ({ ...current, ...patch }));
  }

  reset(): void {
    this.stateSignal.set({ ...INITIAL_STATE });
  }
}

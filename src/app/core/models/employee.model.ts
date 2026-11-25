export interface Employee {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  basicSalary: number;
  status: EmployeeStatus;
  group: string;
  description: string;
}

export type EmployeeStatus = 'Permanent' | 'Contract' | 'Probation' | 'Intern';

export type EmployeeSortField =
  | 'username'
  | 'firstName'
  | 'email'
  | 'group'
  | 'status'
  | 'basicSalary';

export interface EmployeeListState {
  searchTerm: string;
  groupTerm: string;
  sortBy: EmployeeSortField;
  sortDirection: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

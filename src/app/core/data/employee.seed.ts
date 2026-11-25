import { Employee, EmployeeStatus } from '../models/employee.model';

const firstNames = [
  'Aditya', 'Aulia', 'Bima', 'Citra', 'Dimas', 'Dewi', 'Eka', 'Farhan', 'Gita', 'Hana',
  'Indra', 'Intan', 'Joko', 'Kartika', 'Kevin', 'Laras', 'Maya', 'Nadia', 'Rafi', 'Salsa',
];
const lastNames = [
  'Pratama', 'Putri', 'Saputra', 'Wijaya', 'Permata', 'Kusuma', 'Santoso', 'Mahendra',
  'Ramadhan', 'Puspita', 'Setiawan', 'Anggraini', 'Nugroho', 'Lestari', 'Hidayat',
];

export const EMPLOYEE_GROUPS = [
  'Engineering',
  'Product',
  'Design',
  'Human Resources',
  'Finance',
  'Marketing',
  'Operations',
  'Customer Support',
  'Sales',
  'Legal',
] as const;

const statuses: EmployeeStatus[] = ['Permanent', 'Contract', 'Probation', 'Intern'];

export function createSeedEmployees(count = 120): Employee[] {
  return Array.from({ length: count }, (_, index) => {
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[(index * 3 + Math.floor(index / 7)) % lastNames.length];
    const username = `${firstName}.${lastName}.${String(index + 1).padStart(3, '0')}`.toLowerCase();
    const birthDate = new Date(1970 + (index % 27), (index * 7) % 12, (index * 11) % 27 + 1, 12, 0, 0);
    const joinedAt = new Date(2021 + (index % 5), (index * 5) % 12, (index * 3) % 27 + 1, 9, 0, 0);

    return {
      id: `seed-${index + 1}`,
      username,
      firstName,
      lastName,
      email: `${username}@example.com`,
      birthDate: birthDate.toISOString(),
      basicSalary: 5_000_000 + ((index * 875_000) % 18_000_000),
      status: statuses[index % statuses.length],
      group: EMPLOYEE_GROUPS[index % EMPLOYEE_GROUPS.length],
      description: joinedAt.toISOString(),
    };
  });
}


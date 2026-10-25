/** Domain model — camelCase, Dates. */
export interface Item {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

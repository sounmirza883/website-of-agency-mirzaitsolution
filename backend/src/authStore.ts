import bcrypt from "bcryptjs";
import { supabase } from "./supabase.js";

export type Role = "admin" | "employee" | "client";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  status: string;
  dept: string | null;
  position: string | null;
  company: string | null;
  canCreateClients: boolean;
  createdBy: number | null;
}

const memoryUsers: AuthUser[] = [];
let nextId = 1;

if (!supabase) {
  memoryUsers.push({
    id: nextId++,
    name: "Admin",
    email: "admin@mirzaitsolution.com",
    passwordHash: bcrypt.hashSync("ChangeMe123!", 10),
    role: "admin",
    status: "Active",
    dept: null,
    position: null,
    company: null,
    canCreateClients: false,
    createdBy: null,
  });
  console.warn("No Supabase credentials — using in-memory auth. Bootstrap admin: admin@mirzaitsolution.com / ChangeMe123!");
}

function rowToUser(row: any): AuthUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    status: row.status,
    dept: row.dept,
    position: row.position,
    company: row.company,
    canCreateClients: row.can_create_clients,
    createdBy: row.created_by,
  };
}

export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  if (!supabase) return memoryUsers.find((u) => u.email === email) ?? null;
  const { data } = await supabase.from("users").select("*").eq("email", email).maybeSingle();
  return data ? rowToUser(data) : null;
}

export async function findUserById(id: number): Promise<AuthUser | null> {
  if (!supabase) return memoryUsers.find((u) => u.id === id) ?? null;
  const { data } = await supabase.from("users").select("*").eq("id", id).maybeSingle();
  return data ? rowToUser(data) : null;
}

export async function listUsersByRole(role: Role, createdBy?: number): Promise<AuthUser[]> {
  if (!supabase) {
    return memoryUsers.filter((u) => u.role === role && (createdBy == null || u.createdBy === createdBy));
  }
  let query = supabase.from("users").select("*").eq("role", role);
  if (createdBy != null) query = query.eq("created_by", createdBy);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToUser);
}

export async function listAllUsers(): Promise<AuthUser[]> {
  if (!supabase) return [...memoryUsers];
  const { data, error } = await supabase.from("users").select("*");
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToUser);
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  dept?: string | null;
  position?: string | null;
  company?: string | null;
  canCreateClients?: boolean;
  createdBy?: number | null;
}

export class EmailTakenError extends Error {
  constructor() {
    super("Email already in use");
  }
}

export async function createUser(input: CreateUserInput): Promise<AuthUser> {
  if (await findUserByEmail(input.email)) throw new EmailTakenError();
  const passwordHash = await bcrypt.hash(input.password, 10);

  if (!supabase) {
    const user: AuthUser = {
      id: nextId++,
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      status: "Active",
      dept: input.dept ?? null,
      position: input.position ?? null,
      company: input.company ?? null,
      canCreateClients: input.canCreateClients ?? false,
      createdBy: input.createdBy ?? null,
    };
    memoryUsers.push(user);
    return user;
  }

  const { data, error } = await supabase
    .from("users")
    .insert({
      name: input.name,
      email: input.email,
      password_hash: passwordHash,
      role: input.role,
      status: "Active",
      dept: input.dept ?? null,
      position: input.position ?? null,
      company: input.company ?? null,
      can_create_clients: input.canCreateClients ?? false,
      created_by: input.createdBy ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToUser(data);
}

export async function setCanCreateClients(id: number, canCreateClients: boolean): Promise<AuthUser | null> {
  if (!supabase) {
    const user = memoryUsers.find((u) => u.id === id);
    if (!user) return null;
    user.canCreateClients = canCreateClients;
    return user;
  }
  const { data } = await supabase.from("users").update({ can_create_clients: canCreateClients }).eq("id", id).select().maybeSingle();
  return data ? rowToUser(data) : null;
}

export async function updatePassword(id: number, passwordHash: string): Promise<boolean> {
  if (!supabase) {
    const user = memoryUsers.find((u) => u.id === id);
    if (!user) return false;
    user.passwordHash = passwordHash;
    return true;
  }
  const { error } = await supabase.from("users").update({ password_hash: passwordHash }).eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}

export async function setUserStatus(id: number, status: string): Promise<AuthUser | null> {
  if (!supabase) {
    const user = memoryUsers.find((u) => u.id === id);
    if (!user) return null;
    user.status = status;
    return user;
  }
  const { data } = await supabase.from("users").update({ status }).eq("id", id).select().maybeSingle();
  return data ? rowToUser(data) : null;
}

export interface UpdateUserDetailsInput {
  name?: string;
  email?: string;
  dept?: string | null;
  position?: string | null;
  company?: string | null;
}

export async function updateUserDetails(id: number, input: UpdateUserDetailsInput): Promise<AuthUser | null> {
  if (!supabase) {
    const user = memoryUsers.find((u) => u.id === id);
    if (!user) return null;
    if (input.name !== undefined) user.name = input.name;
    if (input.email !== undefined) user.email = input.email;
    if (input.dept !== undefined) user.dept = input.dept;
    if (input.position !== undefined) user.position = input.position;
    if (input.company !== undefined) user.company = input.company;
    return user;
  }
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.email !== undefined) patch.email = input.email;
  if (input.dept !== undefined) patch.dept = input.dept;
  if (input.position !== undefined) patch.position = input.position;
  if (input.company !== undefined) patch.company = input.company;
  const { data } = await supabase.from("users").update(patch).eq("id", id).select().maybeSingle();
  return data ? rowToUser(data) : null;
}

/**
 * Every table/column that points at users(id). Deleting a user detaches their
 * history (sets these to NULL) rather than deleting it, so past projects,
 * invoices and messages survive with no owner.
 *
 * Done explicitly in application code rather than relying solely on the
 * ON DELETE SET NULL constraints in migrate.sql: if that migration hasn't been
 * applied to a given database, the raw DELETE fails with a foreign key
 * violation, and a user with any history becomes undeletable.
 */
const USER_REFERENCES: Array<[table: string, column: string]> = [
  ["admin_projects", "client_id"],
  ["admin_projects", "employee_id"],
  ["employee_tasks", "employee_id"],
  ["employee_status_updates", "employee_id"],
  ["employee_attendance", "employee_id"],
  ["employee_leave_requests", "employee_id"],
  ["client_milestones", "client_id"],
  ["client_invoices", "client_id"],
  ["client_tickets", "client_id"],
  ["project_messages", "client_id"],
  ["project_messages", "sender_id"],
  ["project_files", "uploaded_by"],
  ["project_files", "client_id"],
  ["notifications", "created_by"],
  ["notifications", "target_user_id"],
  ["users", "created_by"],
];

export async function deleteUser(id: number): Promise<boolean> {
  if (!supabase) {
    const idx = memoryUsers.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    memoryUsers.splice(idx, 1);
    for (const u of memoryUsers) if (u.createdBy === id) u.createdBy = null;
    return true;
  }

  const existing = await supabase.from("users").select("id").eq("id", id).maybeSingle();
  if (!existing.data) return false;

  for (const [table, column] of USER_REFERENCES) {
    const { error } = await supabase.from(table).update({ [column]: null }).eq(column, id);
    // A missing table/column just means that feature isn't provisioned in this
    // database — skip it rather than blocking the delete.
    if (error && !/does not exist|schema cache/i.test(error.message)) {
      throw new Error(`Failed detaching ${table}.${column}: ${error.message}`);
    }
  }

  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}

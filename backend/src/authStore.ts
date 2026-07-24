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
    email: "admin@zephtrix.com",
    passwordHash: bcrypt.hashSync("ChangeMe123!", 10),
    role: "admin",
    status: "Active",
    dept: null,
    position: null,
    company: null,
    canCreateClients: false,
    createdBy: null,
  });
  console.warn("No Supabase credentials — using in-memory auth. Bootstrap admin: admin@zephtrix.com / ChangeMe123!");
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

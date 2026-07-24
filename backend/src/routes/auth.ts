import bcrypt from "bcryptjs";
import { Router } from "express";
import { findUserByEmail, findUserById } from "../authStore.js";
import { type AuthedRequest, requireAuth, signToken } from "../middleware/auth.js";

const router = Router();

function toProfile(user: NonNullable<Awaited<ReturnType<typeof findUserByEmail>>>) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    dept: user.dept,
    position: user.position,
    company: user.company,
    canCreateClients: user.canCreateClients,
  };
}

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

  const user = await findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  if (user.status !== "Active") return res.status(403).json({ error: "Account is not active" });

  const token = signToken({ id: user.id, role: user.role, canCreateClients: user.canCreateClients });
  return res.json({ token, user: toProfile(user) });
});

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await findUserById(req.user!.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json(toProfile(user));
});

export default router;

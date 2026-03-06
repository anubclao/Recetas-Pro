import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface User {
  id: string;
  name: string;
  email: string;
  isAuthorized: boolean;
  queries: number;
  isAdmin: boolean;
}

// In-memory user store (simulating a DB)
let users: User[] = [
  {
    id: "admin-1",
    name: "Administrador",
    email: "admin@onesixteen.com",
    isAuthorized: true,
    queries: 0,
    isAdmin: true,
  },
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(bodyParser.json());

  // API Routes
  app.get("/api/users", (req, res) => {
    res.json(users);
  });

  app.post("/api/register", (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Nombre y correo son requeridos" });
    }

    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      isAuthorized: false,
      queries: 0,
      isAdmin: false,
    };

    users.push(newUser);
    res.json(newUser);
  });

  app.post("/api/users/authorize", (req, res) => {
    const { userId, isAuthorized } = req.body;
    const user = users.find((u) => u.id === userId);
    if (user && !user.isAdmin) {
      user.isAuthorized = isAuthorized;
      res.json(user);
    } else {
      res.status(404).json({ error: "Usuario no encontrado o es administrador" });
    }
  });

  app.delete("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const userIndex = users.findIndex((u) => u.id === id);
    if (userIndex !== -1 && !users[userIndex].isAdmin) {
      users.splice(userIndex, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Usuario no encontrado o es administrador" });
    }
  });

  app.post("/api/users/update", (req, res) => {
    const { id, name, email } = req.body;
    const user = users.find((u) => u.id === id);
    if (user && !user.isAdmin) {
      user.name = name || user.name;
      user.email = email || user.email;
      res.json(user);
    } else {
      res.status(404).json({ error: "Usuario no encontrado o es administrador" });
    }
  });

  app.post("/api/queries/increment", (req, res) => {
    const { email } = req.body;
    const user = users.find((u) => u.email === email);
    if (user) {
      user.queries += 1;
      res.json({ queries: user.queries });
    } else {
      res.status(404).json({ error: "Usuario no encontrado" });
    }
  });

  app.post("/api/login", (req, res) => {
    const { email } = req.body;
    const user = users.find((u) => u.email === email);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "Usuario no encontrado" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

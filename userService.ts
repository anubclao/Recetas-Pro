
export interface User {
  id: string;
  name: string;
  email: string;
  isAuthorized: boolean;
  queries: number;
  isAdmin: boolean;
}

const STORAGE_KEY = 'chefmaster_users_db';

const getInitialUsers = (): User[] => [
  {
    id: "admin-1",
    name: "Administrador",
    email: "admin@onesixteen.com",
    isAuthorized: true,
    queries: 0,
    isAdmin: true,
  },
];

export const getUsers = (): User[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const initial = getInitialUsers();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(stored);
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

export const loginUser = async (email: string): Promise<User> => {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error("Usuario no encontrado");
  return user;
};

export const registerUser = async (name: string, email: string): Promise<User> => {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("El correo ya está registrado");
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
  saveUsers(users);
  return newUser;
};

export const authorizeUser = async (userId: string, isAuthorized: boolean): Promise<User> => {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (user && !user.isAdmin) {
    user.isAuthorized = isAuthorized;
    saveUsers(users);
    return user;
  }
  throw new Error("Usuario no encontrado o es administrador");
};

export const deleteUser = async (id: string): Promise<void> => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index !== -1 && !users[index].isAdmin) {
    users.splice(index, 1);
    saveUsers(users);
  } else {
    throw new Error("Usuario no encontrado o es administrador");
  }
};

export const updateUser = async (updatedUser: User): Promise<User> => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index !== -1 && !users[index].isAdmin) {
    users[index] = { ...users[index], ...updatedUser };
    saveUsers(users);
    return users[index];
  }
  throw new Error("Usuario no encontrado o es administrador");
};

export const incrementQueries = async (email: string): Promise<number> => {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (user) {
    user.queries += 1;
    saveUsers(users);
    return user.queries;
  }
  throw new Error("Usuario no encontrado");
};

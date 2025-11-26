// Service to manage users with passwords
export interface UserData {
  id: string;
  email: string;
  name: string;
  password: string; // Hashed password (simple for demo)
  role: "student" | "supervisor";
  bootcamp_name?: string; // For supervisors
  created_at: string;
}

const USERS_STORAGE_KEY = "tuwaiq_users_data";

// Simple password hashing (for demo only - use proper hashing in production)
const hashPassword = (password: string): string => {
  // Simple hash for demo - in production use bcrypt or similar
  return btoa(password).split("").reverse().join("");
};

// Verify password
const verifyPassword = (password: string, hashedPassword: string): boolean => {
  return hashPassword(password) === hashedPassword;
};

// Get all users
export const getAllUsers = (): UserData[] => {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading users:", error);
    return [];
  }
};

// Get user by email
export const getUserByEmail = (email: string): UserData | null => {
  const users = getAllUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
};

// Create new user
export const createUser = (
  email: string,
  password: string,
  name: string,
  role: "student" | "supervisor",
  bootcamp_name?: string
): UserData | null => {
  try {
    const users = getAllUsers();

    // Check if user already exists
    if (getUserByEmail(email)) {
      return null;
    }

    const newUser: UserData = {
      id: `USER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: email.toLowerCase(),
      name,
      password: hashPassword(password),
      role,
      bootcamp_name,
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
};

// Verify login credentials
export const verifyLogin = (
  email: string,
  password: string,
  role: "student" | "supervisor"
): UserData | null => {
  const user = getUserByEmail(email);

  if (!user) {
    return null;
  }

  // Check role matches
  if (user.role !== role) {
    return null;
  }

  // Verify password
  if (!verifyPassword(password, user.password)) {
    return null;
  }

  return user;
};

// Get all supervisors
export const getAllSupervisors = (): UserData[] => {
  return getAllUsers().filter((u) => u.role === "supervisor");
};

// Get supervisors by bootcamp
export const getSupervisorsByBootcamp = (bootcampName: string): UserData[] => {
  return getAllSupervisors().filter(
    (u) => u.bootcamp_name?.toLowerCase() === bootcampName.toLowerCase()
  );
};

// Get all unique bootcamp names
export const getAllBootcamps = (): string[] => {
  const supervisors = getAllSupervisors();
  const bootcamps = supervisors
    .map((s) => s.bootcamp_name)
    .filter((b): b is string => !!b);
  return Array.from(new Set(bootcamps));
};


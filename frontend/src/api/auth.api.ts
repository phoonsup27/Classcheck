import api from "./axios";

export const login = (
  username: string,
  password: string
) => {
  return api.post("/auth/login", {
    username,
    password,
  });
};
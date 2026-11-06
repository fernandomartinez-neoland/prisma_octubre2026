import { createUserModel, findUserModel } from "../models/user.model.js";

export function createUserService(body) {
  const { id, username, email } = body;

  return createUserModel(id, username, email);
}

export async function findUserService(body) {
  try {
    const user = await findUserModel(body.email);

    console.log("modelo", user);
    return {
      status: 200,
      message: user,
    };
  } catch (e) {
    return {
      status: 404,
      message: "usuario no encontrado",
    };
  }
}

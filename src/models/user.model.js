import { db } from "../prisma/db.ts";

export async function createUserModel(id, username, email) {
  try {
    const user = await db.orm.users.create({
      email: email,
      username: username,
    });
    return "ok";
  } catch (e) {
    console.log(e);
    return "error";
  }
}

export async function findUserModel(email) {
  try {
    const user =await db.orm.users
      .where({
        email: email,
      })
      .first();
    if (user!=null) {
      return user;
    } else {
      throw new Error("usuario no encontrado");
    }
  } catch (e) {
    throw new Error("usuario no encontrado");
  }
}

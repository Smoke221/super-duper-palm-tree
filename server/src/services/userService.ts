import { DbUtils } from "../utils/dbUtils";
import { IUser } from "../models/User";

export class UserService {
  static async authenticateUser(
    username: string,
    password: string,
    action: 'signup' | 'login',
    currency: string
  ): Promise<{
    user: IUser;
    message: string;
  }> {
    try {
      const existingUser = await DbUtils.findUserByUsername(username);

      if (action === 'signup') {
        if (existingUser) {
          throw new Error('Username already exists');
        }
        const user = await DbUtils.createUser(username, password, currency);
        return {
          user,
          message: 'User created successfully'
        };
      } else { // login
        if (!existingUser) {
          throw new Error('User not found');
        }
        if (existingUser.password !== password) {
          throw new Error('Invalid password');
        }
        return {
          user: existingUser,
          message: 'Login successful'
        };
      }
    } catch (error) {
      throw error;
    }
  }
}

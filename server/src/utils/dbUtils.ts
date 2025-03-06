import { User, IUser } from '../models/User';

export class DbUtils {
  static async findUserByUsername(username: string): Promise<IUser | null> {
    try {
      return await User.findOne({ username });
    } catch (error) {
      throw error;
    }
  }

  static async createUser(username: string, password: string, currency: string): Promise<IUser> {
    try {
      const user = new User({ username, password, currency });
      return await user.save();
    } catch (error) {
      if ((error as any).code === 11000) { // MongoDB duplicate key error code
        throw new Error('Username already exists');
      }
      throw error;
    }
  }
} 
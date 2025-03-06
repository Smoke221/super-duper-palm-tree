import { Request, Response } from "express";
import { UserService } from "../services/userService";

export class UserController {
  static authenticate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password, action, currency } = req.body;

      // Validate request body
      if (!username || !password || !action) {
        res.status(400).json({
          success: false,
          message: "Username, password and action (signup/login) are required",
        });
        return;
      }

      if ((action !== "signup" && action !== "login") || !currency) {
        res.status(400).json({
          success: false,
          message: "Invalid action or currency",
        });
        return;
      }

      // Validate username format
      if (username.length < 3) {
        res.status(400).json({
          success: false,
          message: "Username must be at least 3 characters long",
        });
        return;
      }

      // Validate password format
      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
        return;
      }

      const result = await UserService.authenticateUser(
        username,
        password,
        action,
        currency
      );

      res.status(action === "signup" ? 201 : 200).json({
        success: true,
        ...result,
        user: {
          username: result.user.username,
          createdAt: result.user.createdAt,
          updatedAt: result.user.updatedAt,
        },
      });
    } catch (error: any) {
      // Handle specific errors
      if (error.message === "Username already exists") {
        res.status(409).json({
          success: false,
          message:
            "Username already exists. Please choose a different username or login instead.",
        });
        return;
      }

      if (error.message === "User not found") {
        res.status(404).json({
          success: false,
          message: "User not found. Please signup first.",
        });
        return;
      }

      if (error.message === "Invalid password") {
        res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
        return;
      }

      // Handle unexpected errors
      console.error("Authentication error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
}

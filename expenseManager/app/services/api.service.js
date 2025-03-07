import axios from "axios";
import UserService from "../helpers/UserName";
// Create axios instance with default config
const api = axios.create({
  baseURL: "http://10.0.18.177:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

class ApiService {
  static async authenticateUser({ username, password, action, currency }) {
    try {
      const response = await api.post('/users/auth', {
        username,
        password,
        action,
        currency
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      if (error.response) {
        return {
          success: false,
          message: error.response.data.message || 'Authentication failed'
        };
      }
      throw error;
    }
  }

  static async getTransactions(startDate, endDate) {
    try {
      const userName = await UserService.getUserName();
      const response = await api.get(`/transactions/${userName}`, {
        params: {
          startDate,
          endDate,
          limit: 10,
          page: 1
        }
      });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async getTransactionStats(startDate, endDate) {
    try {
      const userName = await UserService.getUserName();
      const response = await api.get(`/transactions/${userName}/stats`, {
        params: {
          startDate,
          endDate
        }
      });
      
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handling
  static handleError(error) {
    if (error.response) {
      return {
        status: error.response.status,
        message: error.response.data.message || "An error occurred",
        data: error.response.data,
      };
    } else if (error.request) {
      return {
        status: 503,
        message: "Service unavailable",
        data: null,
      };
    }
    return {
      status: 500,
      message: error.message || "Unknown error occurred",
      data: null,
    };
  }
}

export default ApiService;

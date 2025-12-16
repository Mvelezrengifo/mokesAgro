import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

export const AuthService = {
  async saveToken(token: string): Promise<void> {
    await AsyncStorage.setItem('authToken', token);
  },

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('authToken');
  },

  async saveUser(user: User): Promise<void> {
    await AsyncStorage.setItem('userData', JSON.stringify(user));
  },

  async getUser(): Promise<User | null> {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove(['authToken', 'userData']);
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  }
};
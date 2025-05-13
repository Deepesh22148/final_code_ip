// lib/auth.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeUserId = async (userId: string) => {
    try {
        await AsyncStorage.setItem('@userId', userId);
    } catch (e) {
        console.error('Failed to save user ID', e);
    }
};

export const getUserId = async () => {
    try {
        return await AsyncStorage.getItem('@userId');
    } catch (e) {
        console.error('Failed to fetch user ID', e);
        return null;
    }
};

export const removeUserId = async () => {
    try {
        await AsyncStorage.removeItem('@userId');
    } catch (e) {
        console.error('Failed to remove user ID', e);
    }
};

import { create } from 'zustand';
import * as AuthApi from "../apis/auth.api";
import { USER_ID } from "../constants/index";


const useUserStore = create((set) => ({
    userId: null,
    user: null,
    setUserId: (id) => set({ userId: id }),
    setUser: (userData) => set({ user: userData }),
    fetchUserData: async () => {
        const userId = localStorage.getItem(USER_ID);
        console.log('useUserStore', userId);
        if (userId) {
            try {
                const userData = await AuthApi.getUserById({ userId });
                console.log('userData', userData);
                if (userData.status) {
                    set({ user: userData.user });
                } else {
                    console.error('Failed to fetch user data');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }
    }
}));

export default useUserStore;

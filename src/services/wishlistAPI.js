import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = "https://thiaworld.bbscart.com/api";

const authConfig = async () => {
    const raw = await AsyncStorage.getItem("bbsUser");
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (!parsed?.token) return {};

    return {
        headers: {
            Authorization: `Bearer ${parsed.token}`,
        },
    };
};

export const getWishlist = async () => {
    try {
        const config = await authConfig();
        // If no auth config, return empty array instead of making request
        if (!config.headers?.Authorization) {
            return [];
        }
        const res = await axios.get(`${API_BASE}/wishlist`, config);
        return res.data || [];
    } catch (error) {
        console.log('getWishlist error:', error?.response?.status || error.message);
        // Return empty array on error instead of throwing
        return [];
    }
};

export const toggleWishlist = async (productId) => {
    try {
        const config = await authConfig();
        if (!config.headers?.Authorization) {
            throw new Error('No authentication token');
        }
        const res = await axios.post(
            `${API_BASE}/wishlist/toggle`,
            { productId },
            config
        );
        return res.data;
    } catch (error) {
        console.log('toggleWishlist error:', error?.response?.status || error.message);
        throw error; // Re-throw so caller can handle
    }
};

export const removeWishlist = async (productId) => {
    const config = await authConfig();
    const res = await axios.delete(
        `${API_BASE}/wishlist/${productId}`,
        config
    );
    return res.data;
};

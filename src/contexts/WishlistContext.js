import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    getWishlist,
    toggleWishlist as toggleWishlistAPI,
} from '../services/wishlistAPI';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlistIds, setWishlistIds] = useState(new Set());
    const [loading, setLoading] = useState(true);

    /* ================= LOAD WISHLIST ================= */

    const loadWishlist = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('THIAWORLD_TOKEN');

            if (!token) {
                setWishlistIds(new Set());
                setLoading(false);
                return;
            }

            // getWishlist doesn't take parameters - it gets token internally
            // But it looks for 'bbsUser' in AsyncStorage, so we need to handle this
            const res = await getWishlist();

            const ids = new Set(
                (res || []).map((item) =>
                    item.productId?._id || item.productId || item._id
                )
            );

            setWishlistIds(ids);
        } catch (err) {
            console.log('Wishlist load error', err);
            // Don't crash if wishlist fails to load
            setWishlistIds(new Set());
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadWishlist();
    }, [loadWishlist]);

    /* ================= HELPERS ================= */

    const isWishlisted = useCallback(
        (productId) => {
            return wishlistIds.has(productId);
        },
        [wishlistIds]
    );

    /* ================= TOGGLE ================= */

    const toggleWishlist = async (productId) => {
        try {
            const token = await AsyncStorage.getItem('THIAWORLD_TOKEN');

            if (!token) return;

            // Optimistic UI update
            setWishlistIds((prev) => {
                const updated = new Set(prev);
                if (updated.has(productId)) {
                    updated.delete(productId);
                } else {
                    updated.add(productId);
                }
                return updated;
            });

            // toggleWishlistAPI doesn't take token parameter - it gets it internally
            await toggleWishlistAPI(productId);
        } catch (err) {
            console.log('Wishlist toggle error', err);
            // Reload from backend if something goes wrong
            loadWishlist();
        }
    };

    return (
        <WishlistContext.Provider
            value={{
                wishlistIds,
                isWishlisted,
                toggleWishlist,
                loading,
                reloadWishlist: loadWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
};

/* ================= HOOK ================= */

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error(
            'useWishlist must be used inside WishlistProvider'
        );
    }
    return context;
};

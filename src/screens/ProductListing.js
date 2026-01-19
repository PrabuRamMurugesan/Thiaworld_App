// ProductListings.js — Thiaworld Jewellery (Gold Collection - API Integrated)
import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator,
    Animated, ScrollView, Dimensions, TextInput
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../contexts/CartContext';

const { width } = Dimensions.get('window');
const ITEM_HEIGHT = 200;

const GOLD_PRODUCTS_API = 'https://thiaworld.bbscart.com/api/products/gold';

// ✅ IMAGE URL FIX (VERY IMPORTANT)
const buildImageUrl = (img) => {
    if (!img) return '';

    // already absolute
    if (img.startsWith('http')) return img;

    // if already contains uploads
    if (img.startsWith('uploads/')) {
        return `https://thiaworld.bbscart.com/${img}`;
    }

    // fallback
    return `https://thiaworld.bbscart.com/uploads/${img}`;
};

// ---------------- Hero Banner (UNCHANGED) ----------------
const heroBannerImages = [
    { id: '1', image: require('../assets/img/banner1.jpg'), title: 'Gold Festive Collection' },
    { id: '2', image: require('../assets/img/banner2.jpg'), title: 'Gold Divine Collection' },
    { id: '3', image: require('../assets/img/banner3.jpg'), title: 'Gold Wedding Specials' },
];

const ProductListings = () => {
    const { addToCart } = useCart();

    const [selectedQuantity, setSelectedQuantity] = useState({});
    const [productQuantities, setProductQuantities] = useState({});
    const [wishlist, setWishlist] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('default');

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigation = useNavigation();
    const scrollX = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // ---------------- Auto Slide Banners (UNCHANGED) ----------------
    useEffect(() => {
        const intervalId = setInterval(() => {
            const nextIndex = (currentIndex + 1) % heroBannerImages.length;
            setCurrentIndex(nextIndex);
            scrollViewRef.current?.scrollTo({
                x: width * nextIndex,
                animated: true,
            });
        }, 4000);
        return () => clearInterval(intervalId);
    }, [currentIndex]);

    const onScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        {
            useNativeDriver: false,
            listener: (event) => {
                const index = Math.floor(event.nativeEvent.contentOffset.x / width);
                setCurrentIndex(index);
            },
        }
    );

    // ---------------- FETCH GOLD PRODUCTS FROM API ----------------
    useEffect(() => {
        loadGoldProducts();
    }, [searchQuery, sortOption]);

    const loadGoldProducts = async () => {
        try {
            setLoading(true);

            const response = await fetch(GOLD_PRODUCTS_API);
            const result = await response.json();

            const rawProducts = Array.isArray(result)
                ? result
                : result.items || [];

            let mappedProducts = rawProducts.map((p) => ({
                id: p._id,
                name: p.name,
                category: 'Gold',
                image:
                    p.images && p.images.length > 0
                        ? buildImageUrl(p.images[0])
                        : '',
                priceOptions: [
                    {
                        weight: `${p.netWeight || 0}g`,
                        price: p.finalPrice || p.price || 0,
                    },
                ],
            }));

            // Search
            if (searchQuery) {
                mappedProducts = mappedProducts.filter((p) =>
                    p.name.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            // Sorting
            if (sortOption === 'lowToHigh') {
                mappedProducts.sort(
                    (a, b) => a.priceOptions[0].price - b.priceOptions[0].price
                );
            } else if (sortOption === 'highToLow') {
                mappedProducts.sort(
                    (a, b) => b.priceOptions[0].price - a.priceOptions[0].price
                );
            }

            setProducts(mappedProducts);
        } catch (error) {
            console.log('Gold product fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    const handleAddToCart = (product) => {
        addToCart(product);
    };

    const toggleWishlist = (productId) => {
        setWishlist((prev) => ({ ...prev, [productId]: !prev[productId] }));
    };

    const handleViewProduct = (product) => {
        navigation.navigate('ProductDetails', {
            id: product._id || product.id,
        });
    };

    const incrementQuantity = (productId) => {
        setProductQuantities((prev) => ({
            ...prev,
            [productId]: (prev[productId] || 1) + 1,
        }));
    };

    const decrementQuantity = (productId) => {
        setProductQuantities((prev) => ({
            ...prev,
            [productId]: prev[productId] > 1 ? prev[productId] - 1 : 1,
        }));
    };

    const renderProduct = ({ item }) => {
        const currentPriceOption = selectedQuantity[item.id] || item.priceOptions[0];
        const productQuantity = productQuantities[item.id] || 1;
        const isWishlisted = wishlist[item.id] || false;

        return (
            <View style={styles.productContainer}>
                <Image
                    source={{ uri: item.image }}
                    style={styles.productImage}
                />

                <View style={styles.productDetails}>
                    <Text style={styles.productName}>{item.name}</Text>

                    <Text style={styles.productPrice}>
                        ₹{formatPrice(currentPriceOption.price * productQuantity)}
                    </Text>

                    <View style={styles.quantityControl}>
                        <TouchableOpacity onPress={() => decrementQuantity(item.id)}>
                            <Text>➖</Text>
                        </TouchableOpacity>
                        <Text style={styles.quantityValue}>{productQuantity}</Text>
                        <TouchableOpacity onPress={() => incrementQuantity(item.id)}>
                            <Text>➕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.actionIcons}>
                        <TouchableOpacity onPress={() => toggleWishlist(item.id)}>
                            <Text>{isWishlisted ? '💛' : '🤍'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.addToCartButton}
                            onPress={() => handleAddToCart(item)}
                        >
                            <Text style={styles.addToCartText}>🛒 Add to Cart</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleViewProduct(item)}>
                            <Text>👁️</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.heroBanner}>
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={onScroll}
                >
                    {heroBannerImages.map((item) => (
                        <View key={item.id} style={styles.slide}>
                            <Image source={item.image} style={styles.bannerImage} />
                        </View>
                    ))}
                </ScrollView>
            </View>

            <TextInput
                style={styles.searchBar}
                placeholder="Search gold jewellery..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            <View style={styles.filterRow}>
                <View style={styles.filterContainer}>
                    <Text style={styles.filterText}>Sort:</Text>
                    <Picker
                        selectedValue={sortOption}
                        style={styles.categoryPicker}
                        onValueChange={(value) => setSortOption(value)}
                    >
                        <Picker.Item label="Default" value="default" />
                        <Picker.Item label="Price: Low to High" value="lowToHigh" />
                        <Picker.Item label="Price: High to Low" value="highToLow" />
                    </Picker>
                </View>
            </View>

            <Text style={styles.totalProductsText}>
                Total Products: {products.length}
            </Text>

            {loading ? (
                <ActivityIndicator size="large" color="#c5a900" />
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderProduct}
                    keyExtractor={(item) => item.id}
                    getItemLayout={(data, index) => ({
                        length: ITEM_HEIGHT,
                        offset: ITEM_HEIGHT * index,
                        index,
                    })}
                />
            )}
        </View>
    );
};

// ---------------- STYLES (UNCHANGED) ----------------
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#faf9f6' },
    heroBanner: { height: 180, marginBottom: 10 },
    slide: { width, justifyContent: 'center', alignItems: 'center' },
    bannerImage: { width: '100%', height: 180, resizeMode: 'cover' },
    searchBar: {
        backgroundColor: '#fff',
        margin: 10,
        borderRadius: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    filterRow: { flexDirection: 'row', justifyContent: 'space-between' },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    filterText: { fontWeight: 'bold', marginRight: 5 },
    categoryPicker: { height: 50, width: 200 },
    totalProductsText: {
        textAlign: 'right',
        marginRight: 15,
        color: '#777',
    },
    productContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 10,
        margin: 10,
        borderRadius: 8,
    },
    productImage: { width: 90, height: 90, borderRadius: 8 },
    productDetails: { flex: 1, paddingLeft: 10 },
    productName: { fontSize: 16, fontWeight: 'bold', color: '#6c4a00' },
    productPrice: { fontSize: 15, fontWeight: 'bold', marginTop: 4 },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    quantityValue: { marginHorizontal: 10 },
    actionIcons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    addToCartButton: {
        backgroundColor: '#e6d36f',
        padding: 6,
        borderRadius: 5,
    },
    addToCartText: { fontWeight: 'bold' },
});

export default ProductListings;

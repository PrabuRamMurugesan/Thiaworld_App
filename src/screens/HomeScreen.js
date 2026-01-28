// HomeScreen.js — Thiaworld Jewellery Shop Model

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
} from 'react-native';
import Cart from '../assets/icons/cart.png';
import Bell from '../assets/icons/notification.png';
import ThiaworldLogo from '../assets/thiaworldlogo.png';
import { useCart } from '../contexts/CartContext';
// ✅ Removed drawer imports - drawer requires reanimated
// import { createDrawerNavigator } from '@react-navigation/drawer';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
import axios from 'axios';
import { useWishlist } from '../contexts/WishlistContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../contexts/ThemeContext';

// ✅ Removed unused navigator declarations
// const Drawer = createDrawerNavigator();
// const Stack = createNativeStackNavigator();

const { width } = Dimensions.get('window');

// ------------------------------
// Mock Data (Jewellery Shop Model)
// ------------------------------
const BANNERS = [
  { id: 'b1', image: 'https://wallpapercat.com/w/full/d/0/9/2309811-1920x1080-desktop-1080p-fashion-jewelry-wallpaper.jpg', deeplink: 'Category:Gold' },
  { id: 'b2', image: 'https://image.wedmegood.com/resized-nw/1300X/wp-content/uploads/2018/09/1488193318_28-1.jpg', deeplink: 'Category:Silver' },
  { id: 'b3', image: 'https://www.mygoldguide.in/sites/default/files/Mavinakayi_Addigai_001.jpg', deeplink: 'Category:Bridal' },
];

const CATEGORIES = [
  { id: 'c1', name: 'Gold', icon: 'https://e7.pngegg.com/pngimages/162/1008/png-clipart-jewellery-bangle-earring-gold-gold-banner-miscellaneous-ring.png', deeplink: 'Category:Gold' },
  { id: 'c2', name: 'Silver', icon: 'https://tse1.mm.bing.net/th/id/OIP.iO12wLu8e98gHsQ_2QFq6gHaHa?cb=thfvnext&rs=1&pid=ImgDetMain&o=7&rm=3', deeplink: 'Category:Silver' },
  { id: 'c3', name: 'Diamond', icon: 'https://tse2.mm.bing.net/th/id/OIP.Y0boa0FE69h-qWnRifAwiwHaHe?cb=thfvnext&w=620&h=626&rs=1&pid=ImgDetMain&o=7&rm=3', deeplink: 'Category:Diamond' },
  { id: 'c4', name: 'Platinum', icon: 'https://mustafajewellery.com/wp-content/uploads/2023/07/Studio-Session-009_1-1.png' },
  { id: 'c5', name: 'Bridal', icon: 'https://gauravjewellers.com/wp-content/uploads/2023/05/IMG_1850-1024x1024.jpg' },
  { id: 'c6', name: 'Daily Wear', icon: 'https://4.imimg.com/data4/OA/DM/GLADMIN-26240777/10-1000x1000.jpg' },
  { id: 'c7', name: 'Coins & Bars', icon: 'https://ranialankar.com/wp-content/uploads/2022/01/20220130_183347.jpg' },
  { id: 'c8', name: 'Gifts', icon: 'https://3.imimg.com/data3/LG/JX/MY-2662192/gold-necklace-500x500.png' },
];

const PRODUCTS_TRENDING = [];

const PRODUCTS_DEALS = [];


const PRODUCTS_RECO = [];
const PRODUCTS_FEATURED = [];

// ------------------------------
// Utility: Countdown to Midnight
// ------------------------------
const useMidnightCountdown = () => {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(23, 59, 59, 999);
      setRemaining(Math.max(0, midnight.getTime() - now.getTime()));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  const hrs = Math.floor(remaining / 3_600_000);
  const mins = Math.floor((remaining % 3_600_000) / 60_000);
  const secs = Math.floor((remaining % 60_000) / 1000);
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};


// ------------------------------
// Header with Drawer Button
// ------------------------------
const Header = ({ navigation, cartCount, onSearchPress, onCartPress, onNotifPress }) => {
  const { colors } = useTheme();
  const iconColor = colors?.text || '#000000';
  
  return (
    <View style={styles.headerContainer}>
      {/* Logo Row - Top */}
      <View style={styles.logoRow}>
        <Image 
          source={ThiaworldLogo} 
          style={styles.logo} 
          resizeMode="contain"
        />
      </View>

      {/* Navigation Row - Bottom */}
      <View style={styles.navRow}>
        {/* Drawer Menu Button */}
        <TouchableOpacity 
          style={styles.iconWrapper} 
          onPress={() => navigation?.openDrawer?.()}
        >
          <Icon name="menu" size={24} color={iconColor} />
        </TouchableOpacity>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={onSearchPress}
          activeOpacity={0.8}
        >
          <Icon name="search" size={16} color="#888" style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Search for products</Text>
        </TouchableOpacity>

        {/* Notification Icon */}
        <TouchableOpacity style={styles.iconWrapper} onPress={onNotifPress}>
          <Image source={Bell} style={styles.icon} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>

        {/* Cart Icon */}
        <TouchableOpacity style={styles.iconWrapper} onPress={onCartPress}>
          <Image source={Cart} style={styles.icon} />
          {cartCount && cartCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{String(cartCount)}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ------------------------------
// Hero Carousel
// ------------------------------
const HeroCarousel = ({ banners, onBannerPress }) => {
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % banners.length;
        listRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(id);
  }, [banners.length]);

  const renderItem = ({ item }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={() => onBannerPress?.(item)}>
      <Image source={{ uri: item.image }} style={styles.bannerImg} />
    </TouchableOpacity>
  );

  return (
    <View>
      <FlatList
        ref={listRef}
        data={banners}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onMomentumScrollEnd={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(i);
        }}
      />
      <View style={styles.dotsRow}>
        {banners.map((b, i) => (
          <View key={b.id} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
};

// ------------------------------
// Categories
// ------------------------------
const CategoryStrip = ({ categories, onPress }) => (
  <View style={styles.catWrap}>
    <FlatList
      data={categories}
      keyExtractor={(it) => it.id}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.catItem} onPress={() => onPress?.(item)}>
          <Image source={{ uri: item.icon }} style={styles.catIcon} />
          <Text style={styles.catName} numberOfLines={1}>{item.name}</Text>
        </TouchableOpacity>
      )}
      horizontal
      showsHorizontalScrollIndicator={false}
    />
  </View>
);

// ------------------------------
// Sections & Cards
// ------------------------------
const Section = ({ title, rightLabel, onRightPress, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHead}>
      {title ? <Text style={styles.sectionTitle}>{String(title)}</Text> : null}
      {rightLabel ? (
        <TouchableOpacity onPress={onRightPress}>
          <Text style={styles.sectionAction}>{String(rightLabel)}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
    {children}
  </View>
);

const ProductCard = ({ item, onPress, small }) => {
  const { isWishlisted, toggleWishlist } = useWishlist();

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    try {
      await toggleWishlist(item.id);
    } catch (error) {
      // Error handling is done in WishlistContext
      console.log('Wishlist toggle error:', error);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        small && styles.cardSmall,
        { position: 'relative' }
      ]}
      onPress={() => onPress?.(item)}
      activeOpacity={0.8}
    >
      {/* Wishlist Icon */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 15,
          padding: 4,
        }}
        onPress={handleWishlistToggle}
      >
        <Icon
          name={isWishlisted(item.id) ? 'heart' : 'heart-outline'}
          size={20}
          color={isWishlisted(item.id) ? 'red' : '#666'}
        />
      </TouchableOpacity>

      {/* Product Image */}
      <Image
        source={{ uri: item.image }}
        style={[styles.cardImg, small && styles.cardImgSmall]}
      />

      {/* Product Details */}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{item.price}</Text>
          <Text style={styles.mrp}>₹{item.mrp}</Text>
        </View>
        <Text style={styles.rating}>⭐ {item.rating}</Text>
        {item.purity ? <Text style={styles.purity}>Purity: {item.purity}</Text> : null}
        <View style={styles.metaRow}>
          {item.badge ? <Text style={styles.badgeChip}>{item.badge}</Text> : null}
          {item.lowStock ? <Text style={styles.lowStock}>Low stock</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};


const DealsCard = ({ item, onPress }) => (
  <TouchableOpacity style={[styles.card, styles.cardDeal]} onPress={() => onPress?.(item)}>
    <Image source={{ uri: item.image }} style={styles.cardImg} />
    <View style={styles.cardBody}>
      <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>₹{item.price}</Text>
        <Text style={styles.mrp}>₹{item.mrp}</Text>
      </View>
      <Text style={styles.discountTag}>{item.discountPct}% OFF</Text>
    </View>
  </TouchableOpacity>
);

// ------------------------------
// Bottom Navigation Bar
// ------------------------------
const BottomNavItem = ({ iconName, text, onPress, isActive, iconColor, textColor, badge }) => {
  // Validate and sanitize all inputs
  const badgeCount = (badge !== undefined && badge !== null && typeof badge === 'number') ? Math.max(0, badge) : 0;
  const showBadge = badgeCount > 0;
  
  // Ensure text is always a valid string (never undefined/null)
  const displayText = (text !== undefined && text !== null) ? String(text) : '';
  
  // Ensure colors are valid strings (never undefined/null)
  const validIconColor = (iconColor && typeof iconColor === 'string') ? iconColor : '#999999';
  const validTextColor = (textColor && typeof textColor === 'string') ? textColor : '#999999';
  
  // Ensure iconName is valid
  const validIconName = (iconName && typeof iconName === 'string') ? iconName : 'help-circle-outline';
  
  // Ensure onPress is a function
  const handlePress = typeof onPress === 'function' ? onPress : () => {};
  
  return (
    <TouchableOpacity 
      style={styles.bottomNavItem} 
      onPress={handlePress} 
      activeOpacity={0.7}
    >
      {isActive === true && validIconColor ? (
        <View style={[styles.activeIndicator, { backgroundColor: validIconColor }]} />
      ) : null}
      <View style={styles.iconContainer}>
        <Icon 
          name={validIconName} 
          size={24} 
          color={validIconColor} 
          style={styles.bottomNavIcon}
        />
        {showBadge === true && badgeCount > 0 ? (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{badgeCount > 99 ? '99+' : String(badgeCount)}</Text>
          </View>
        ) : null}
      </View>
      {displayText && displayText.length > 0 ? (
        <Text style={[styles.bottomNavText, { color: validTextColor }]}>{displayText}</Text>
      ) : null}
    </TouchableOpacity>
  );
};

function BottomNavigationBar({ navigation, currentRoute }) {
  const { colors } = useTheme();
  const { cartCount } = useCart();
  
  // Gold/primary color for active state, appropriate for jewellery app
  const activeColor = colors.primary || '#B8860B';
  const inactiveColor = '#999999';
  const activeTextColor = activeColor;
  const inactiveTextColor = inactiveColor;
  
  // Ensure cartCount is a valid number
  const validCartCount = cartCount && typeof cartCount === 'number' ? cartCount : 0;
  
  const navItems = [
    {
      key: 'DailyRate',
      icon: 'trending-up',
      iconOutline: 'trending-up',
      text: 'Daily Rate',
      route: 'Ratings',
      badge: undefined,
    },
    {
      key: 'Dashboard',
      icon: 'business',
      iconOutline: 'business-outline',
      text: 'Dashboard',
      route: 'Dashboard',
      badge: undefined,
    },
    {
      key: 'ThiaSecurePlan',
      icon: 'lock-closed',
      iconOutline: 'lock-closed-outline',
      text: 'ThiaSecurePlan',
      route: 'ThiaSecurePlan',
      badge: undefined,
    },
    {
      key: 'UserAccount',
      icon: 'person',
      iconOutline: 'person-outline',
      text: 'User Account',
      route: 'Account',
      badge: undefined,
    },
    {
      key: 'AboutUs',
      icon: 'information-circle',
      iconOutline: 'information-circle-outline',
      text: 'About Us',
      route: 'AboutUs',
      badge: undefined,
    },
  ].filter(item => item && item.key && item.text && item.route); // Filter out any invalid items
  
  const handleNavigate = (route) => {
    if (navigation && navigation.navigate) {
      navigation.navigate(route);
    }
  };
  
  return (
    <View style={styles.bottomNavBar}>
      {navItems.map((item) => {
        // Check if current route matches this item's route or key
        const routeMatch = currentRoute === item.route || currentRoute === item.key;
        // Also check if we're on HomeMain and this is the first item (DailyRate)
        const isHomeAndFirst = (currentRoute === 'HomeMain' || currentRoute === 'Home') && item.key === 'DailyRate';
        const isActive = routeMatch || isHomeAndFirst;
        
        const iconName = isActive ? (item.icon || 'help-circle-outline') : (item.iconOutline || 'help-circle-outline');
        const iconColor = isActive ? activeColor : inactiveColor;
        const textColor = isActive ? activeTextColor : inactiveTextColor;
        
        // Ensure all props are valid
        const safeText = item.text ? String(item.text) : '';
        const safeBadge = item.badge !== undefined && item.badge !== null ? Number(item.badge) : 0;
        
        return (
          <BottomNavItem
            key={item.key || 'nav-item'}
            iconName={iconName}
            text={safeText}
            onPress={() => handleNavigate(item.route)}
            isActive={isActive}
            iconColor={iconColor}
            textColor={textColor}
            badge={safeBadge}
          />
        );
      })}
    </View>
  );
}

// ------------------------------
// HomeScreen
// ------------------------------
export default function HomeScreen({ navigation, route }) {
  const { cartCount, cartReady } = useCart();
  const { colors, isDark } = useTheme();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('DailyRate');
  
  // Track current route for bottom navigation
  useFocusEffect(
    useCallback(() => {
      // Get current route name from navigation state
      const routeName = route?.name || navigation?.getState?.()?.routes?.[navigation?.getState?.()?.index]?.name || 'DailyRate';
      setCurrentRoute(routeName);
    }, [route, navigation])
  );

  const countdown = useMidnightCountdown();
  useEffect(() => {
    axios
      .get('https://thiaworld.bbscart.com/api/products/new-arrivals')
      .then((res) => {
        PRODUCTS_TRENDING.length = 0; // clear existing

        res.data.forEach((p) => {
          const price = Number(p.price || 0);
          const mrp = p.discount
            ? Math.round(price / (1 - p.discount / 100))
            : price;

          PRODUCTS_TRENDING.push({
            id: p._id,
            title: p.name,
            price: price,
            mrp: mrp,
            rating: 4.8,
            image: p.images?.[0]
              ? `https://thiaworld.bbscart.com/uploads/${p.images[0].split('|')[0]}`
              : 'https://via.placeholder.com/150',
            badge: p.discount ? 'Trending' : null,
            purity: p.purity || '916',
          });
        });
      })
      .catch((err) => {
        console.log('Trending API error', err);
      });
  }, []);
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const id = setTimeout(() => {
      if (!mounted) return;
      setLoading(false);
    }, 800);
    return () => { mounted = false; clearTimeout(id); };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);
  useEffect(() => {
    axios
      .get("https://thiaworld.bbscart.com/api/products/new-arrivals")
      .then((res) => {
        PRODUCTS_RECO.length = 0;

        const list = res.data?.items || res.data || [];

        list.forEach((p) => {
          const price = Number(p.price || 0);
          const mrp = p.discount
            ? Math.round(price / (1 - p.discount / 100))
            : price;

          PRODUCTS_RECO.push({
            id: p._id,
            title: p.name,
            price: price,
            mrp: mrp,
            rating: 4.9,
            image: p.images?.[0]
              ? `https://thiaworld.bbscart.com/uploads/${p.images[0].split("|")[0]}`
              : "https://via.placeholder.com/150",
            purity: p.purity || "916",
            badge: p.discount ? 'New' : null,
          });
        });
      })
      .catch((err) => {
        console.log("New arrivals (Recommended) API error", err);
      });
  }, []);
  useEffect(() => {
    axios
      .get("https://thiaworld.bbscart.com/api/products/new-arrivals")
      .then((res) => {
        PRODUCTS_DEALS.length = 0;

        res.data.forEach((p) => {
          const price = Number(p.price || 0);
          const mrp = p.discount
            ? Math.round(price / (1 - p.discount / 100))
            : price;

          PRODUCTS_DEALS.push({
            id: p._id,
            title: p.name,
            price: price,
            mrp: mrp,
            rating: 4.8,
            image: p.images?.[0]
              ? `https://thiaworld.bbscart.com/uploads/${p.images[0].split("|")[0]}`
              : "https://via.placeholder.com/150",
            discountPct: p.discount || 0,
          });
        });
      })
      .catch((err) => {
        console.log("New arrivals (Deals) API error", err);
      });
  }, []);
  useEffect(() => {
    axios
      .get("https://thiaworld.bbscart.com/api/products/featured")
      .then((res) => {
        PRODUCTS_FEATURED.length = 0;

        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.products || [];

        list.forEach((p) => {
          const price = Number(p.price || 0);
          const mrp = p.discount
            ? Math.round(price / (1 - p.discount / 100))
            : price;

          PRODUCTS_FEATURED.push({
            id: p._id,
            title: p.name,
            price: price,
            mrp: mrp,
            rating: p.rating || 4.8,
            image: p.images?.[0]
              ? `https://thiaworld.bbscart.com/uploads/${p.images[0].split("|")[0]}`
              : "https://via.placeholder.com/150",
            purity: p.purity || "916",
          });
        });
      })
      .catch((err) => {
        console.log("Featured products API error", err);
      });
  }, []);

  const navigate = (screen, params) => {
    if (navigation && navigation.navigate) navigation.navigate(screen, params);
  };

  const onBannerPress = (item) => {
    const [type, name] = item.deeplink.split(':');
    if (type === 'Category') navigate('Category', { name });
  };

  const onProductPress = (item) => navigate('ProductDetails', { id: item.id });

  const renderHorizontal = (data, renderCard) => (
    <FlatList
      data={data}
      keyExtractor={(it) => it.id}
      renderItem={({ item }) => renderCard(item)}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 12 }}
    />
  );

  // ✅ Create dynamic styles based on theme
  const dynamicStyles = {
    ...styles,
    container: { ...styles.container, backgroundColor: colors.background },
    header: { ...styles.header, backgroundColor: colors.header },
    searchBar: { ...styles.searchBar, backgroundColor: isDark ? colors.surface : '#f2f2f2' },
    card: { ...styles.card, backgroundColor: colors.card },
    trust: { ...styles.trust, backgroundColor: colors.surface },
    skeletonBanner: { ...styles.skeletonBanner, backgroundColor: colors.surface },
    skeletonRow: { ...styles.skeletonRow, backgroundColor: colors.surface },
  };

  if (loading) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <Header cartCount={cartCount} navigation={navigation} onSearchPress={() => navigate('Search')} onCartPress={() => navigate('Cart')} onNotifPress={() => navigate('Cart')} />
        <View style={dynamicStyles.skeletonBanner} />
        <View style={dynamicStyles.skeletonRow} />
        <View style={dynamicStyles.skeletonRow} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <Header navigation={navigation} onSearchPress={() => navigate('Search')} onCartPress={() => navigate('Cart')} onNotifPress={() => navigate('Notifications')} />
        <View style={styles.errorBox}>
          <Text style={[styles.errorText, { color: colors.text }]}>Something went wrong. Please try again.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => setError(null)}>
            <Text style={styles.retryTxt}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <Header
          navigation={navigation}
          cartCount={cartCount}
          onSearchPress={() => navigate('Search')}
          onCartPress={() => navigate('Cart')}
          onNotifPress={() => navigate('Notifications')}
        />

        <HeroCarousel banners={BANNERS} onBannerPress={onBannerPress} />
        <CategoryStrip categories={CATEGORIES} onPress={(c) => navigate('Products', { name: c.name })} />
        <Section title={`Today's Gold Deals  ⏱  ${countdown}`} rightLabel="View all" onRightPress={() => navigate('Products')}>
          {renderHorizontal(PRODUCTS_DEALS, (p) => <DealsCard key={p.id} item={p} onPress={onProductPress} />)}
        </Section>
        <Section
          title="Featured Collections"
          rightLabel="View all"
          onRightPress={() => navigate("Products")}
        >

          {renderHorizontal(PRODUCTS_FEATURED, (p) => (
            <ProductCard
              key={p.id}
              item={p}
              onPress={onProductPress}
            />
          ))}
        </Section>

        <Section title="Trending Jewellery" rightLabel="View all" onRightPress={() => navigate('Products')}>
          {renderHorizontal(PRODUCTS_TRENDING, (p) => (
            <ProductCard key={p.id} item={p} onPress={onProductPress} />
          ))}
        </Section>

        <Section title="Recommended For You" rightLabel="View all" onRightPress={() => navigate('Products')}>
          {renderHorizontal(PRODUCTS_RECO, (p) => <ProductCard key={p.id} item={p} onPress={onProductPress} small />)}
        </Section>
      </ScrollView>
      <BottomNavigationBar navigation={navigation} currentRoute={currentRoute} />
    </SafeAreaView>
  );
}

// ------------------------------
// Styles
// ------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerContainer: { backgroundColor: '#fff', elevation: 4 },
  logoRow: { alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 12 },
  logo: { width: 280, height: 100 },
  navRow: { flexDirection: 'row', alignItems: 'center', padding: 8, paddingTop: 4 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f2f2f2', borderRadius: 20, paddingHorizontal: 12, marginHorizontal: 8, height: 40, justifyContent: 'flex-start' },
  searchIcon: { marginRight: 6 },
  searchPlaceholder: { color: '#888' },
  iconWrapper: { marginHorizontal: 4 },
  icon: { width: 22, height: 22, resizeMode: 'contain' },
  badge: { position: 'absolute', top: -3, right: -6, backgroundColor: 'red', borderRadius: 8, paddingHorizontal: 4 },
  badgeText: { color: '#fff', fontSize: 10 },
  bannerImg: { width, height: 160, resizeMode: 'cover' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginVertical: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ddd', marginHorizontal: 2 },
  dotActive: { backgroundColor: '#000' },
  catWrap: { paddingVertical: 8, backgroundColor: '#fff' },
  catItem: { width: 70, alignItems: 'center', marginHorizontal: 6 },
  catIcon: { width: 50, height: 50, borderRadius: 25 },
  catName: { fontSize: 12, marginTop: 4, textAlign: 'center' },
  section: { marginTop: 12 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, marginBottom: 6 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' },
  sectionAction: { color: 'tomato' },
  card: { backgroundColor: '#fff', borderRadius: 8, margin: 6, width: 160, overflow: 'hidden', elevation: 3 },
  cardSmall: { width: 140 },
  cardDeal: { borderWidth: 1, borderColor: 'tomato' },
  cardImg: { width: '100%', height: 120, resizeMode: 'cover' },
  cardImgSmall: { height: 100 },
  cardBody: { padding: 8 },
  cardTitle: { fontSize: 13, fontWeight: '500' },
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  price: { fontWeight: 'bold', marginRight: 6 },
  mrp: { textDecorationLine: 'line-through', color: '#888', fontSize: 12 },
  rating: { marginTop: 2, fontSize: 12, color: '#444' },
  purity: { fontSize: 11, color: '#666', marginTop: 2 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  badgeChip: { backgroundColor: '#FFD700', paddingHorizontal: 6, borderRadius: 10, fontSize: 10, marginRight: 4 },
  lowStock: { color: 'red', fontSize: 11 },
  discountTag: { color: 'green', fontWeight: 'bold', marginTop: 2 },
  bottomNavBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 20,
    height: 3,
    borderRadius: 2,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 2,
  },
  bottomNavIcon: {
    // Icon styling handled by Icon component
  },
  badgeContainer: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bottomNavText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  skeletonBanner: { width: '100%', height: 160, backgroundColor: '#eee', marginVertical: 12 },
  skeletonRow: { width: '90%', height: 80, backgroundColor: '#eee', marginHorizontal: '5%', marginVertical: 8, borderRadius: 8 },
  errorBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: 'red' },
  retryBtn: { marginTop: 12, backgroundColor: 'tomato', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  retryTxt: { color: '#fff', fontWeight: 'bold' },
});

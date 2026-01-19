// ProductDetail.js (FULL FILE REPLACE) — SAME UI as your old 600+ lines, ONLY API integration added

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../contexts/CartContext';

const { width, height } = Dimensions.get('window');

// ==============================
// API
// ==============================
const API_PRODUCT_BY_ID = 'https://thiaworld.bbscart.com/api/products/';
const API_BASE = 'https://thiaworld.bbscart.com';

const buildImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  if (img.startsWith('/uploads')) return `${API_BASE}${img}`;
  return `${API_BASE}/uploads/${img}`;
};

// ==============================
// FALLBACK MOCKS (UI SAME)
// ==============================
const mockProduct = {
  id: 101,
  name: '18K Gold Diamond Ring',
  brand: 'Sparkle Jewelers',
  price: 34999,
  mrp: 45999,
  discountLabel: '24% off',
  description:
    'This elegant 18K yellow gold ring is studded with certified diamonds, making it perfect for special occasions and daily wear. BIS hallmarked and crafted to perfection.',
  images: [
    'https://tse1.explicit.bing.net/th/id/OIP.oUtSKvOmJ3Wb2l2Wd3BJ9wHaJ4?cb=thfvnext&w=1500&h=2000&rs=1&pid=ImgDetMain&o=7&rm=3',
    'https://c8.alamy.com/comp/BNP0KT/turkey-istanbul-sultanahmet-grand-bazaar-bazaar-bazaars-market-markets-BNP0KT.jpg',
    'https://beldibi.biz/sites/default/files/foto/turkeygold4.jpg',
    'https://turkishjewellery.org/resim/urun/N00600.3-3.jpg',
  ],
  rating: 4.6,
  ratingCount: 865,
  reviewCount: 248,
  highlights: [
    '18K Yellow Gold',
    'BIS Hallmarked',
    'Natural Certified Diamonds',
    'Gross Weight: 5.2 g',
    'Ring Size: Adjustable',
  ],
  details: {
    Metal: '18K Yellow Gold',
    Purity: '75%',
    DiamondType: 'Natural Certified',
    DiamondWeight: '0.35 ct',
    GrossWeight: '5.2 g',
    Size: 'Adjustable',
    Certification: 'IGI Certified',
    Warranty: 'Lifetime Free Polishing',
  },
  policies: {
    cod: true,
    returnsDays: 15,
    warranty: 'Lifetime Exchange & Polishing',
  },
  offers: [
    'Bank Offer: 10% Instant Discount with XYZ Bank Cards',
    'Free Shipping on all orders',
    'Festive Offer: Free Gold Coin on purchases above ₹50,000',
  ],
};

// Similar products (mock)
const mockSimilar = [
  {
    id: 102,
    name: '22K Gold Necklace',
    image:
      'https://png.pngtree.com/png-clipart/20230506/original/pngtree-gold-necklace-png-image_9123931.png',
    price: 79999,
    mrp: 99999,
    rating: 4.5,
  },
  {
    id: 103,
    name: 'Diamond Earrings',
    image:
      'https://png.pngtree.com/png-clipart/20230916/original/pngtree-diamond-earrings-jewelry-png-image_11075489.png',
    price: 25999,
    mrp: 32999,
    rating: 4.2,
  },
  {
    id: 104,
    name: 'Platinum Couple Bands',
    image:
      'https://png.pngtree.com/png-vector/20240412/ourmid/pngtree-platinum-couple-rings-png-image_12345678.png',
    price: 65999,
    mrp: 74999,
    rating: 4.7,
  },
];

// Mock reviews
const mockReviews = [
  {
    id: 'r1',
    user: 'Meera',
    rating: 5,
    title: 'Loved it! 💍',
    text: 'The ring sparkles beautifully, feels premium and authentic. Packaging was luxurious!',
    date: '2025-07-10',
  },
  {
    id: 'r2',
    user: 'Arjun',
    rating: 4,
    title: 'Elegant gift',
    text: 'Bought this for my wife. She absolutely loves it. Certification gives peace of mind.',
    date: '2025-06-28',
  },
  {
    id: 'r3',
    user: 'Pooja',
    rating: 4,
    title: 'Classy & beautiful',
    text: 'The design is elegant. Delivery was quick. Only wish the size options were more detailed.',
    date: '2025-05-21',
  },
];

const currency = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN')}`;

const StarRow = ({ value, size = 16 }) => {
  const full = Math.floor(value || 0);
  const hasHalf = (value || 0) - full >= 0.5;
  const total = 5;
  const stars = [];
  for (let i = 0; i < total; i++) {
    if (i < full) stars.push('★');
    else if (i === full && hasHalf) stars.push('☆');
    else stars.push('☆');
  }
  return (
    <Text style={{ fontSize: size, letterSpacing: 1 }}>{stars.join(' ')}</Text>
  );
};

// ==============================
// HELPERS (NORMALIZE API DATA)
// ==============================
const isHttp = (u) => typeof u === 'string' && (u.startsWith('http://') || u.startsWith('https://'));

const pickFirst = (...vals) => {
  for (const v of vals) {
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
};

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const normalizeImages = (p) => {
  const arr = [];
  const push = (x) => {
    if (!x) return;
    if (Array.isArray(x)) {
      x.forEach((y) => push(y));
      return;
    }
    if (typeof x === 'string') {
      arr.push(x);
      return;
    }
  };

  push(p.images);
  push(p.gallery_imgs);
  push(p.galleryImages);
  push(p.gallery);
  push(p.product_imgs);
  push(p.productImages);

  push(p.image);
  push(p.product_img);
  push(p.productImg);
  push(p.product_image);
  push(p.mainImage);

  // dedupe
  const out = [];
  const seen = new Set();
  for (const u of arr) {
    const key = String(u).trim();
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out
    .map(buildImageUrl)
    .filter(Boolean);

};

const normalizeProduct = (raw) => {
  const p = raw || {};

  const id = pickFirst(p._id, p.id, p.productId);
  const name = pickFirst(p.name, p.title, p.productName);
  const description = pickFirst(p.description, p.desc, p.shortDesc, p.longDesc);

  const price = pickFirst(p.finalPrice, p.price, p.sellingPrice, p.salePrice, p.offerPrice);
  const mrp = pickFirst(p.strikePrice, p.mrp, p.mrpPrice, p.originalPrice, p.actualPrice);

  const metal = pickFirst(p.metal, p.metalType, p.metal_name, p.metalName, p.category);
  const purity = pickFirst(p.purity, p.karat, p.karatValue, p.purityLabel);
  const netWeight = pickFirst(p.netWeight, p.net_weight, p.net_wt, p.netWt, p.weight);
  const grossWeight = pickFirst(p.grossWeight, p.gross_weight, p.gross_wt, p.grossWt);
  const making = pickFirst(p.making, p.makingCharges, p.makingCharge, p.making_cost);
  const gst = pickFirst(p.gst, p.gstPercent, p.gst_percentage);

  const category = pickFirst(p.category, p.productCategory, p.metalType);

  const images = normalizeImages(p);
  const fallbackImage = pickFirst(p.image, p.product_img, p.productImg);

  const normalized = {
    id: id ? String(id) : String(mockProduct.id),
    name: name || mockProduct.name,
    brand: pickFirst(p.brand, p.vendorName, p.vendor) || mockProduct.brand,
    price: toNumber(price || 0),
    mrp: toNumber(mrp || 0),
    description: description || mockProduct.description,

    images: images.length ? images : (fallbackImage ? [fallbackImage] : mockProduct.images),
    image: fallbackImage || (images[0] || mockProduct.images[0]),

    rating: toNumber(p.rating || p.avgRating || mockProduct.rating),
    ratingCount: toNumber(p.ratingCount || p.ratingsCount || p.totalRatings || mockProduct.ratingCount),
    reviewCount: toNumber(p.reviewCount || p.reviewsCount || p.totalReviews || mockProduct.reviewCount),

    // important for CartContext category routing
    category: (category || metal || '').toString().toLowerCase(),

    // UI blocks
    offers: Array.isArray(p.offers) ? p.offers : mockProduct.offers,
    policies: {
      cod: pickFirst(p.cod, p.cashOnDelivery, p.policies?.cod, mockProduct.policies.cod),
      returnsDays: pickFirst(p.returnsDays, p.returnDays, p.policies?.returnsDays, mockProduct.policies.returnsDays),
      warranty: pickFirst(p.warranty, p.policies?.warranty, mockProduct.policies.warranty),
    },
    highlights: Array.isArray(p.highlights) ? p.highlights : [
      metal ? `${String(metal)}` : 'Gold',
      purity ? `Purity: ${String(purity)}` : 'Purity: 22K',
      netWeight ? `Net Weight: ${String(netWeight)}` : 'Net Weight: -',
      grossWeight ? `Gross Weight: ${String(grossWeight)}` : 'Gross Weight: -',
    ],

    details: {
      Metal: metal ? String(metal) : '',
      Purity: purity ? String(purity) : '',
      NetWeight: netWeight ? String(netWeight) : '',
      GrossWeight: grossWeight ? String(grossWeight) : '',
      Making: making ? String(making) : '',
      GST: gst ? String(gst) : '',
    },
  };

  // remove empty spec rows (so UI looks clean)
  const cleanedDetails = {};
  Object.entries(normalized.details || {}).forEach(([k, v]) => {
    const s = String(v || '').trim();
    if (s) cleanedDetails[k === 'NetWeight' ? 'Net Weight' : k === 'GrossWeight' ? 'Gross Weight' : k] = s;
  });
  normalized.details = Object.keys(cleanedDetails).length ? cleanedDetails : mockProduct.details;

  // ensure mrp is valid
  if (!normalized.mrp || normalized.mrp < normalized.price) normalized.mrp = normalized.price;

  return normalized;
};

const ProductDetails = ({ route }) => {
  const navigation = useNavigation();
  const { addToCart } = useCart();

  const productParam = route?.params?.product || null;
  const productId =
    route?.params?.id ||
    route?.params?.productId ||
    productParam?._id ||
    productParam?.id ||
    null;

  const [apiProduct, setApiProduct] = useState(() => normalizeProduct(productParam || mockProduct));
  const [similar, setSimilar] = useState(route?.params?.similar || mockSimilar);
  const [reviews, setReviews] = useState(route?.params?.reviews || mockReviews);
  const [loading, setLoading] = useState(true);

  const [activeIndex, setActiveIndex] = useState(0);
  const [specsOpen, setSpecsOpen] = useState(false);
  const galleryRef = useRef(null);

  // ==============================
  // FETCH PRODUCT BY ID (API)
  // ==============================
  useEffect(() => {
    let alive = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);

        // If no id, still show with passed product/mock (no infinite loading)
        if (!productId) {
          setApiProduct(normalizeProduct(productParam || mockProduct));
          setLoading(false);
          return;
        }

        const url = `${API_PRODUCT_BY_ID}${String(productId)}`;
        const res = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await res.json().catch(() => ({}));

        if (!alive) return;

        // backend may return { product } or direct object
        const raw = data?.product || data?.data || data || {};
        const normalized = normalizeProduct(raw);

        setApiProduct(normalized);

        // Similar & reviews: if backend sends, use it; else keep old mock arrays (UI stays same)
        if (Array.isArray(data?.similarProducts)) setSimilar(data.similarProducts);
        if (Array.isArray(data?.reviews)) setReviews(data.reviews);

        setLoading(false);
      } catch (e) {
        if (!alive) return;
        setApiProduct(normalizeProduct(productParam || mockProduct));
        setLoading(false);
      }
    };

    fetchProduct();
    return () => {
      alive = false;
    };
  }, [productId]);

  const product = apiProduct;

  const youSave = useMemo(() => {
    const mrp = product.mrp || product.price;
    const save = Math.max(0, (mrp || 0) - (product.price || 0));
    return save;
  }, [product]);

  const discountPercent = useMemo(() => {
    const mrp = product.mrp || product.price;
    if (!mrp) return 0;
    return Math.round(((mrp - product.price) / mrp) * 100);
  }, [product]);

  const handleAddToCart = () => {
    // Ensure category exists for CartContext routing
    const safeProduct = {
      ...product,
      id: product.id,
      category: (product.category || '').toLowerCase() || 'gold',
      image: product.image || product.images?.[0],
    };
    addToCart(safeProduct);
    navigation.navigate('Cart');
  };

  const handleBuyNow = () => {
    const buyNowItem = {
      ...product,
      id: product.id,
      category: (product.category || 'gold').toLowerCase(),
      image: product.image || product.images?.[0],

      // ✅ CRITICAL: inject final price
      price: Number(
        product.finalPrice ??
        product.totalPayable ??
        product.price ??
        0
      ),

      // ✅ ensure quantity
      quantity: product.quantity || 1,

      buyNow: true,
    };

    navigation.navigate('Checkout', {
      buyNowItem,
    });
  };

  const handleChangeAddress = () => {
    navigation.navigate('Settings');
  };

  const onPressThumb = (index) => {
    setActiveIndex(index);
    galleryRef.current?.scrollTo({ x: index * width, animated: true });
  };

  const renderSimilarItem = ({ item }) => (
    <TouchableOpacity
      style={styles.similarCard}
      onPress={() =>
        navigation.navigate('ProductDetails', {
          id: item?._id || item?.id,
          product: item,
        })
      }
    >
      <Image source={{ uri: item.image }} style={styles.similarImage} />
      <Text style={styles.similarName} numberOfLines={2}>
        {item.name}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text style={styles.similarPrice}>{currency(item.price)}</Text>
        {item.mrp ? (
          <Text style={styles.similarMrp}>{currency(item.mrp)}</Text>
        ) : null}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <StarRow value={item.rating || 0} size={12} />
        <Text style={styles.similarRating}>{(item.rating || 0).toFixed(1)}</Text>
      </View>
    </TouchableOpacity>
  );

  // IMPORTANT: keep UI identical — only show a loading text (same behavior as before)
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f6f7f9', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: '#333' }}>Loading Products</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f6f7f9' }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Image Gallery */}
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            ref={galleryRef}
            onScroll={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveIndex(idx);
            }}
            scrollEventThrottle={16}
          >
            {(product.images?.length ? product.images : [product.image]).map((img, i) => (
              <Image key={i} source={{ uri: img }} style={styles.productImage} />
            ))}
          </ScrollView>

          {/* Thumbnails */}
          <View style={styles.thumbRow}>
            {(product.images?.length ? product.images : [product.image]).map((img, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => onPressThumb(i)}
                style={[
                  styles.thumbnailWrap,
                  activeIndex === i && styles.thumbnailActive,
                ]}
              >
                <Image source={{ uri: img }} style={styles.thumbnail} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Title & Ratings */}
        <View style={styles.detailsCard}>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.ratingRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <StarRow value={product.rating || 0} />
              <Text style={styles.ratingText}>
                {(product.rating || 0).toFixed(1)} ({(product.ratingCount || 0).toLocaleString('en-IN')} ratings)
              </Text>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.ratingText}>
                {(product.reviewCount || 0).toLocaleString('en-IN')} reviews
              </Text>
            </View>
          </View>
        </View>

        {/* Price & Offers */}
        <View style={styles.detailsCard}>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{currency(product.price)}</Text>
            {product.mrp && product.mrp !== product.price ? (
              <Text style={styles.mrp}>{currency(product.mrp)}</Text>
            ) : null}
            {discountPercent > 0 ? (
              <Text style={styles.discount}>{discountPercent}% off</Text>
            ) : null}
          </View>
          {youSave > 0 ? (
            <Text style={styles.youSave}>You save {currency(youSave)}</Text>
          ) : null}

          {/* Offer bullets */}
          {product.offers?.length ? (
            <View style={{ marginTop: 12 }}>
              {product.offers.map((o, idx) => (
                <View key={idx} style={styles.offerItem}>
                  <Text style={styles.offerBullet}>•</Text>
                  <Text style={styles.offerText}>{o}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* Delivery Address */}
        <View style={styles.detailsCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Delivery</Text>
            <TouchableOpacity onPress={handleChangeAddress}>
              <Text style={styles.linkText}>Change address in Settings ›</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.deliveryLine}>Deliver to: Your saved address</Text>
          <Text style={styles.deliveryEta}>Estimated delivery: 2–4 days</Text>
        </View>

        {/* Policies (COD / Returns) */}
        <View style={[styles.detailsCard, styles.chipsRow]}>
          {product.policies?.cod ? (
            <View style={styles.chip}>
              <Text style={styles.chipText}>Cash on Delivery</Text>
            </View>
          ) : null}
          {product.policies?.returnsDays ? (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{product.policies.returnsDays}-Day Returns</Text>
            </View>
          ) : null}
          {product.policies?.warranty ? (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{product.policies.warranty}</Text>
            </View>
          ) : null}
        </View>

        {/* Highlights */}
        {product.highlights?.length ? (
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Highlights</Text>
            {product.highlights.map((h, i) => (
              <View key={i} style={styles.highlightItem}>
                <Text style={styles.offerBullet}>•</Text>
                <Text style={styles.highlightText}>{h}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Description */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Product Description</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* Specifications (collapsible) */}
        <View style={styles.detailsCard}>
          <TouchableOpacity onPress={() => setSpecsOpen((v) => !v)} style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            <Text style={styles.linkText}>{specsOpen ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
          {specsOpen ? (
            <View style={{ marginTop: 8 }}>
              {Object.entries(product.details || {}).map(([key, val]) => (
                <View key={key} style={styles.specRow}>
                  <Text style={styles.specKey}>{key}</Text>
                  <Text style={styles.specVal}>{String(val)}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* Customer Reviews */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Customer Reviews</Text>
          <View style={styles.reviewSummaryRow}>
            <View style={styles.reviewScoreBox}>
              <Text style={styles.reviewScore}>{(product.rating || 0).toFixed(1)}</Text>
              <StarRow value={product.rating || 0} />
              <Text style={styles.reviewCountText}>
                {(product.ratingCount || 0).toLocaleString('en-IN')} ratings & {(product.reviewCount || 0).toLocaleString('en-IN')} reviews
              </Text>
            </View>
          </View>

          {(reviews || []).map((r) => (
            <View key={r.id} style={styles.reviewItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.userBadge}>
                  <Text style={styles.userBadgeText}>{r.user?.[0]?.toUpperCase()}</Text>
                </View>
                <Text style={styles.reviewUser}>{r.user}</Text>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.reviewDate}>{r.date}</Text>
              </View>
              <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <StarRow value={r.rating} />
                <Text style={styles.reviewTitle}>{r.title}</Text>
              </View>
              <Text style={styles.reviewText}>{r.text}</Text>
            </View>
          ))}

          <TouchableOpacity onPress={() => navigation.navigate('AllReviews', { productId: product.id })}>
            <Text style={styles.linkText}>See all reviews ›</Text>
          </TouchableOpacity>
        </View>

        {/* Similar Products */}
        {similar?.length ? (
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Similar Products</Text>
            <FlatList
              horizontal
              data={similar}
              keyExtractor={(item) => String(item?._id || item?.id)}
              renderItem={renderSimilarItem}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        ) : null}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky footer actions */}
      <View style={styles.footerBar}>
        <TouchableOpacity style={[styles.footerBtn, styles.btnOutline]} onPress={handleAddToCart}>
          <Text style={[styles.footerBtnText, styles.btnOutlineText]}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.footerBtn, styles.btnFill]} onPress={handleBuyNow}>
          <Text style={[styles.footerBtnText, styles.btnFillText]}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const CARD_BG = '#ffffff';
const PRIMARY = '#96B416';
const TEXT_DARK = '#23262B';
const TEXT_MUTED = '#6B7280';
const BORDER = '#E5E7EB';

const styles = StyleSheet.create({
  container: {
    paddingBottom: 12,
  },
  productImage: {
    width,
    height: height * 0.45,
    resizeMode: 'contain',
    backgroundColor: '#fff',
  },
  thumbRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 10,
    marginTop: 10,
  },
  thumbnailWrap: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  thumbnailActive: {
    borderColor: PRIMARY,
    borderWidth: 2,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  detailsCard: {
    backgroundColor: CARD_BG,
    marginTop: 12,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: BORDER,
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  ratingRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingText: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  dot: { color: TEXT_MUTED },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: PRIMARY,
  },
  mrp: {
    fontSize: 14,
    color: TEXT_MUTED,
    textDecorationLine: 'line-through',
  },
  discount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#DCFCE7',
    borderRadius: 6,
  },
  youSave: {
    marginTop: 4,
    fontSize: 12,
    color: '#065F46',
  },
  offerItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 6,
  },
  offerBullet: { color: TEXT_MUTED },
  offerText: { flex: 1, color: TEXT_DARK },

  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_DARK,
  },
  linkText: {
    color: PRIMARY,
    fontWeight: '600',
  },
  deliveryLine: { marginTop: 8, color: TEXT_DARK },
  deliveryEta: { marginTop: 2, color: TEXT_MUTED, fontSize: 12 },

  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: BORDER,
  },
  chipText: { color: TEXT_DARK, fontWeight: '600' },

  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 6,
  },
  highlightText: { flex: 1, color: TEXT_DARK },

  description: { marginTop: 6, color: TEXT_DARK, lineHeight: 20 },

  specRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  specKey: { width: 120, color: TEXT_MUTED },
  specVal: { flex: 1, color: TEXT_DARK },

  reviewSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 8,
  },
  reviewScoreBox: { alignItems: 'flex-start', gap: 4 },
  reviewScore: { fontSize: 28, fontWeight: '800', color: TEXT_DARK },
  reviewCountText: { color: TEXT_MUTED, marginTop: 2 },

  reviewItem: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 12,
  },
  userBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E9F5D2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userBadgeText: { color: PRIMARY, fontWeight: '800' },
  reviewUser: { fontWeight: '700', color: TEXT_DARK },
  reviewDate: { color: TEXT_MUTED },
  reviewTitle: { fontWeight: '700', color: TEXT_DARK },
  reviewText: { marginTop: 6, color: TEXT_DARK, lineHeight: 20 },

  similarCard: {
    width: 160,
    backgroundColor: '#fff',
    marginRight: 12,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    overflow: 'hidden',
  },
  similarImage: { width: '100%', height: 120, resizeMode: 'cover' },
  similarName: { padding: 8, paddingBottom: 0, fontSize: 14, color: TEXT_DARK },
  similarPrice: { paddingLeft: 8, fontWeight: '700', color: PRIMARY },
  similarMrp: {
    fontSize: 12,
    color: TEXT_MUTED,
    textDecorationLine: 'line-through',
  },
  similarRating: { fontSize: 12, color: TEXT_MUTED },

  footerBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    backgroundColor: '#ffffffee',
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutline: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: PRIMARY,
  },
  btnOutlineText: { color: PRIMARY, fontWeight: '800' },
  btnFill: { backgroundColor: PRIMARY },
  btnFillText: { color: '#fff', fontWeight: '800' },
  footerBtnText: { fontSize: 16 },
});

export default ProductDetails;

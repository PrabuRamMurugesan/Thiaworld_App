import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useCart } from '../contexts/CartContext';

const buildImageUrl = (img) => {
  if (!img) return '';
  if (img.startsWith('http')) return img;
  if (img.startsWith('uploads/')) {
    return `https://thiaworld.bbscart.com/${img}`;
  }
  return `https://thiaworld.bbscart.com/uploads/${img}`;
};

export default function CartScreen() {
  const {
    mergedCart = [],
    updateQuantity,
    removeFromCart,
  } = useCart();

  // 🔒 SAFETY: empty cart
  if (!Array.isArray(mergedCart)) {
    return (
      <View style={styles.center}>
        <Text>Loading cart...</Text>
      </View>
    );
  }

  const increaseQty = (item) => {
    updateQuantity(item.id, item.category, item.quantity + 1);
  };

  const decreaseQty = (item) => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.category, item.quantity - 1);
    }
  };

  const getTotal = () =>
    mergedCart.reduce(
      (sum, item) =>
        sum + item.priceOptions[0].price * item.quantity,
      0
    );

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <Image
        source={{ uri: buildImageUrl(item.image) }}
        style={styles.itemImage}
      />

      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>
          ₹{item.priceOptions[0].price * item.quantity}
        </Text>

        <View style={styles.qtyRow}>
          <TouchableOpacity
            onPress={() => decreaseQty(item)}
            style={styles.qtyBtn}
          >
            <Text>-</Text>
          </TouchableOpacity>

          <Text style={styles.qtyText}>{item.quantity}</Text>

          <TouchableOpacity
            onPress={() => increaseQty(item)}
            style={styles.qtyBtn}
          >
            <Text>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => removeFromCart(item.id, item.category)}
        >
          <Text style={styles.removeText}>REMOVE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#faf8f3' }}>
      {mergedCart.length === 0 ? (
        <View style={styles.center}>
          <Text>Your cart is empty</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={mergedCart}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Price Details</Text>

            <View style={styles.summaryRow}>
              <Text>Total</Text>
              <Text>₹{getTotal()}</Text>
            </View>
          </View>

          {/* Checkout disabled for now */}
          <View style={styles.placeOrderBtn}>
            <Text style={styles.placeOrderText}>
              CHECKOUT (NEXT STEP)
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 12,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  itemImage: { width: 90, height: 90, borderRadius: 8 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#4A2C2A' },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#B8860B' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  qtyBtn: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  qtyText: { marginHorizontal: 10 },
  removeText: { color: '#8B0000', marginTop: 6 },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 15,
    borderRadius: 10,
  },
  summaryTitle: { fontWeight: 'bold', marginBottom: 6 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  placeOrderBtn: {
    backgroundColor: '#B8860B',
    padding: 16,
    alignItems: 'center',
  },
  placeOrderText: { color: '#fff', fontWeight: 'bold' },
});

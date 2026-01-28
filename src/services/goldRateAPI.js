import axios from 'axios';

const API_BASE = 'https://thiaworld.bbscart.com/api';

/**
 * Fetch latest gold rates from API
 * Returns the most recent rate group for Gold
 */
export const fetchGoldRates = async () => {
  try {
    // Try different endpoint patterns
    const endpoints = [
      `${API_BASE}/goldrate/grouped?metalType=Gold`,
      `https://thiaworld.bbscart.com/goldrate/grouped?metalType=Gold`,
      `${API_BASE}/api/goldrate/grouped?metalType=Gold`,
    ];
    
    let response = null;
    let lastError = null;
    
    for (const endpoint of endpoints) {
      try {
        response = await axios.get(endpoint);
        if (response.data) break; // Success, exit loop
      } catch (err) {
        lastError = err;
        continue; // Try next endpoint
      }
    }
    
    if (!response || !response.data) {
      console.log('No gold rates found, tried endpoints:', endpoints);
      return null;
    }
    
    // API returns array of grouped rates, get the most recent one
    const groups = Array.isArray(response.data) ? response.data : [];
    
    if (groups.length === 0) {
      console.log('No gold rates found in API response');
      return null;
    }
    
    // Sort by effectiveDate descending to get the latest
    const sortedGroups = groups.sort((a, b) => {
      const dateA = new Date(a.effectiveDate);
      const dateB = new Date(b.effectiveDate);
      return dateB - dateA; // Most recent first
    });
    
    const latestGroup = sortedGroups[0];
    
    console.log('API Response - Latest Group:', latestGroup);
    
    // API returns rates - check if they're per gram or need conversion
    // Normal rates per gram should be around 5000-7000 for gold
    // If rates are extremely high (like 100000+), they might be per 10g or per kg
    let rate24 = latestGroup.rate24 || 0;
    let rate22 = latestGroup.rate22 || 0;
    let rate18 = latestGroup.rate18 || 0;
    
    // If rates seem too high (likely per 10g), convert to per gram
    // Typical gold rate per 10g is around 50000-70000, per gram would be 5000-7000
    if (rate24 > 10000) {
      console.log('Rates appear to be per 10g, converting to per gram');
      rate24 = rate24 / 10;
      rate22 = rate22 / 10;
      rate18 = rate18 / 10;
    }
    
    // API returns rates per gram (rate24, rate22, rate18)
    return {
      rate24: rate24 || 0, // per gram
      rate22: rate22 || 0, // per gram
      rate18: rate18 || 0, // per gram
      marketPrice: latestGroup.marketPrice || 0,
      source: latestGroup.source || 'Manual',
      effectiveDate: latestGroup.effectiveDate || new Date().toISOString(),
    };
  } catch (error) {
    console.log('Error fetching gold rates:', error?.response?.data || error.message);
    return null;
  }
};

/**
 * Fetch silver rates (if available)
 */
export const fetchSilverRates = async () => {
  try {
    // Try different endpoint patterns
    const endpoints = [
      `${API_BASE}/goldrate/grouped?metalType=Silver`,
      `https://thiaworld.bbscart.com/goldrate/grouped?metalType=Silver`,
      `${API_BASE}/api/goldrate/grouped?metalType=Silver`,
    ];
    
    let response = null;
    
    for (const endpoint of endpoints) {
      try {
        response = await axios.get(endpoint);
        if (response.data) break; // Success, exit loop
      } catch (err) {
        continue; // Try next endpoint
      }
    }
    
    if (!response || !response.data) {
      return null;
    }
    
    const groups = Array.isArray(response.data) ? response.data : [];
    
    if (groups.length === 0) {
      return null;
    }
    
    const sortedGroups = groups.sort((a, b) => {
      const dateA = new Date(a.effectiveDate);
      const dateB = new Date(b.effectiveDate);
      return dateB - dateA;
    });
    
    const latestGroup = sortedGroups[0];
    
    // Silver rates might be structured differently, adjust as needed
    return {
      rate: latestGroup.rate24 || latestGroup.ratePerGram || latestGroup.rate || 0, // per gram
      marketPrice: latestGroup.marketPrice || 0,
      source: latestGroup.source || 'Manual',
      effectiveDate: latestGroup.effectiveDate || new Date().toISOString(),
    };
  } catch (error) {
    console.log('Error fetching silver rates:', error?.response?.data || error.message);
    return null;
  }
};

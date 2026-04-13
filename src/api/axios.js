import axios from "axios";
import NetInfo from "@react-native-community/netinfo";
import { Alert } from "react-native";
import offlineService from "./offlineService";

const API = axios.create(
  {
    baseURL: "https://raisers-o5vpr.ondigitalocean.app",
    headers: { "Content-Type": "application/json" },
  });

// Sync queue when network status changes to online
NetInfo.addEventListener((state) => {
  if (state.isConnected) {
    offlineService.syncQueue(API);
  }

});

API.interceptors.request.use(
  async (config) => {
    // Optimization: Only check NetInfo for GET requests (to serve from cache early)
    // For POST/PUT/DELETE, we let the request proceed and handle failures in response interceptor
    if (config.method === 'get') {
      const state = await NetInfo.fetch();
      if (!state.isConnected) {
        const cachedData = await offlineService.getCachedResponse(config.url);
        if (cachedData) {
          return Promise.reject({
            message: "OFFLINE_CACHE_HIT",
            config,
            cachedData
          });
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  async (response) => {

    if (response.config.method === 'get') {
      await offlineService.cacheGetResponse(response.config.url, response.data);
    }
    return response;
  },
  async (error) => {
    const { config } = error;


    if (error.message === "OFFLINE_CACHE_HIT") {
      return Promise.resolve({
        data: error.cachedData,
        status: 200,
        statusText: "OK",
        headers: {},
        config: error.config,
        request: {}
      });
    }

    // If it's a network error and a non-GET request (not login/register), add to queue
    if (!error.response && config && config.method !== 'get' && !config.url.includes('/auth/')) {
      await offlineService.addToQueue(config.url, config.method, JSON.parse(config.data || "{}"));
      // Resolve with a "queued" status instead of rejecting
      return Promise.resolve({
        data: {
          success: true,
          status: 'queued',
          message: "You are offline. Action saved and will sync later."
        }
      });
    }
    // Recovery for GET requests that failed due to network
    if (!error.response && config && config.method === 'get') {
      const cachedData = await offlineService.getCachedResponse(config.url);
      if (cachedData) {
        return Promise.resolve({
          data: cachedData,
          status: 200,
          statusText: "OK",
          headers: {},
          config: config,
          request: {}
        });
      }
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

export const loginUser = (email, password) => {
  return API.post("/auth/login", { email, password });
};

export const registerUser = (name, email, password) => {
  return API.post("/auth/register", { name, email, password });
};

export default API;

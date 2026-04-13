import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

const QUEUE_KEY = "OFFLINE_QUEUE";
const CACHE_PREFIX = "CACHE_";

const offlineService = {
    // --- Request Queue Management ---

    async addToQueue(endpoint, method, data) {
        try {
            const queue = JSON.parse((await AsyncStorage.getItem(QUEUE_KEY)) || "[]");
            queue.push({ endpoint, method, data, timestamp: Date.now() });
            await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
            console.log("Request added to offline queue:", endpoint);
        } catch (e) {
            console.error("Failed to add to queue", e);
        }
    },

    async syncQueue(apiInstance) {
        const isConnected = (await NetInfo.fetch()).isConnected;
        if (!isConnected) return;

        try {
            const queue = JSON.parse((await AsyncStorage.getItem(QUEUE_KEY)) || "[]");
            if (queue.length === 0) return;

            console.log(`Syncing ${queue.length} offline requests...`);

            const newQueue = [];
            for (const req of queue) {
                try {
                    await apiInstance.request({
                        url: req.endpoint,
                        method: req.method,
                        data: req.data,
                    });
                    console.log("Successfully synced:", req.endpoint);
                } catch (e) {
                    console.error("Failed to sync request, keeping in queue:", req.endpoint, e);
                    newQueue.push(req);
                }
            }

            await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
        } catch (e) {
            console.error("Sync failed", e);
        }
    },

    // --- Data Caching ---

    async cacheData(key, data) {
        try {
            await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
        } catch (e) {
            console.error("Failed to cache data", e);
        }
    },

    async cacheGetResponse(url, data) {
        try {
            if (!url || !data) return;
            const key = `API_GET_${url.replace(/[^a-zA-Z0-9]/g, '_')}`;
            await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.error("Failed to cache GET response", e);
        }
    },

    async getCachedData(key) {
        try {
            const data = await AsyncStorage.getItem(CACHE_PREFIX + key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error("Failed to get cached data", e);
            return null;
        }
    },

    async getCachedResponse(url) {
        try {
            if (!url) return null;
            const key = `API_GET_${url.replace(/[^a-zA-Z0-9]/g, '_')}`;
            const cached = await AsyncStorage.getItem(CACHE_PREFIX + key);
            if (cached) {
                const parsed = JSON.parse(cached);
                console.log("Serving from offline cache:", url);
                return parsed.data;
            }
            return null;
        } catch (e) {
            console.error("Failed to retrieve cached response", e);
            return null;
        }
    },

    // --- Auth Cache (For Offline Login) ---

    async cacheAuth(email, credentials) {
        try {
            // Store hashed/safe credentials for offline verification
            // For this demo, we'll store a small object. In production, use more secure methods.
            await AsyncStorage.setItem(`AUTH_${email.toLowerCase()}`, JSON.stringify(credentials));
        } catch (e) {
            console.error("Failed to cache auth", e);
        }
    },

    async verifyOfflineAuth(email, password) {
        try {
            const cached = await AsyncStorage.getItem(`AUTH_${email.toLowerCase()}`);
            if (!cached) return null;

            const creds = JSON.parse(cached);
            if (creds.password === password) {
                return creds.response; // Return the cached login response
            }
            return null;
        } catch (e) {
            console.error("Offline verification failed", e);
            return null;
        }
    }
};

export default offlineService;

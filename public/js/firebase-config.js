// Firebase configuration and initialization
// Replace with your Firebase config
const firebaseConfig = {
    // Add your Firebase configuration here
    apiKey: "your-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    databaseURL: "https://your-project-id-default-rtdb.firebaseio.com/",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Firebase SDK imports (using CDN for demo purposes)
// In a real project, you would use: import { initializeApp } from 'firebase/app';
let app, database, auth;

// Initialize Firebase when the script loads
async function initializeFirebase() {
    try {
        // For demo purposes, we'll simulate Firebase
        // In production, uncomment the lines below and replace with actual Firebase
        
        /*
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js');
        const { getDatabase, ref, set, get, remove, onValue, push } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js');
        const { getAuth, signInWithEmailAndPassword, signOut } = await import('https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js');
        
        app = initializeApp(firebaseConfig);
        database = getDatabase(app);
        auth = getAuth(app);
        */
        
        // Demo simulation
        window.firebaseApp = {
            initialized: true,
            database: new MockDatabase(),
            auth: new MockAuth()
        };
        
        console.log('Firebase initialized successfully (Demo Mode)');
    } catch (error) {
        console.error('Error initializing Firebase:', error);
    }
}

// Mock Database for demo purposes
class MockDatabase {
    constructor() {
        this.data = {
            flights: {
                'flight1': {
                    flightNumber: 'AA123',
                    origin: 'New York',
                    destination: 'Los Angeles',
                    departureTime: '2024-01-15T10:30',
                    gate: 'A12',
                    status: 'On Time',
                    createdAt: Date.now()
                },
                'flight2': {
                    flightNumber: 'UA456',
                    origin: 'Chicago',
                    destination: 'Miami',
                    departureTime: '2024-01-15T14:45',
                    gate: 'B7',
                    status: 'Delayed',
                    createdAt: Date.now()
                }
            },
            passengers: {
                'passenger1': {
                    firstName: 'John',
                    lastName: 'Doe',
                    flightNumber: 'AA123',
                    seatNumber: '12A',
                    email: 'john.doe@email.com',
                    phone: '+1 234 567 8900',
                    checkInStatus: 'Checked In',
                    createdAt: Date.now()
                }
            },
            staff: {
                'staff1': {
                    firstName: 'Jane',
                    lastName: 'Smith',
                    employeeId: 'EMP001',
                    role: 'Pilot',
                    assignedFlight: 'AA123',
                    status: 'Active',
                    createdAt: Date.now()
                }
            },
            gates: {
                'gate1': {
                    gateNumber: 'A12',
                    terminal: 'Terminal A',
                    assignedFlight: 'AA123',
                    status: 'Occupied',
                    createdAt: Date.now()
                },
                'gate2': {
                    gateNumber: 'B7',
                    terminal: 'Terminal B',
                    assignedFlight: 'UA456',
                    status: 'Occupied',
                    createdAt: Date.now()
                }
            }
        };
    }

    ref(path) {
        return new MockRef(path, this.data);
    }

    get(path) {
        return Promise.resolve(this.getDataAtPath(path));
    }

    set(path, value) {
        this.setDataAtPath(path, value);
        return Promise.resolve();
    }

    push(path, value) {
        const key = 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.setDataAtPath(`${path}/${key}`, { ...value, id: key });
        return Promise.resolve({ key });
    }

    remove(path) {
        this.removeDataAtPath(path);
        return Promise.resolve();
    }

    getDataAtPath(path) {
        const parts = path.split('/').filter(p => p);
        let current = this.data;
        for (const part of parts) {
            current = current[part];
            if (current === undefined) break;
        }
        return current;
    }

    setDataAtPath(path, value) {
        const parts = path.split('/').filter(p => p);
        let current = this.data;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) current[parts[i]] = {};
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
    }

    removeDataAtPath(path) {
        const parts = path.split('/').filter(p => p);
        let current = this.data;
        for (let i = 0; i < parts.length - 1; i++) {
            current = current[parts[i]];
            if (!current) return;
        }
        delete current[parts[parts.length - 1]];
    }
}

class MockRef {
    constructor(path, data) {
        this.path = path;
        this.data = data;
    }

    get() {
        const parts = this.path.split('/').filter(p => p);
        let current = this.data;
        for (const part of parts) {
            current = current[part];
            if (current === undefined) break;
        }
        return Promise.resolve({ val: () => current });
    }

    set(value) {
        const parts = this.path.split('/').filter(p => p);
        let current = this.data;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) current[parts[i]] = {};
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
        return Promise.resolve();
    }

    push(value) {
        const key = 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const parts = this.path.split('/').filter(p => p);
        let current = this.data;
        for (const part of parts) {
            if (!current[part]) current[part] = {};
            current = current[part];
        }
        current[key] = { ...value, id: key };
        return Promise.resolve({ key });
    }

    remove() {
        const parts = this.path.split('/').filter(p => p);
        let current = this.data;
        for (let i = 0; i < parts.length - 1; i++) {
            current = current[parts[i]];
            if (!current) return Promise.resolve();
        }
        delete current[parts[parts.length - 1]];
        return Promise.resolve();
    }
}

// Mock Auth for demo purposes
class MockAuth {
    constructor() {
        this.currentUser = null;
    }

    signInWithEmailAndPassword(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email === 'admin@airport.com' && password === 'admin123') {
                    this.currentUser = { email, uid: 'admin123' };
                    resolve({ user: this.currentUser });
                } else {
                    reject(new Error('Invalid credentials'));
                }
            }, 1000);
        });
    }

    signOut() {
        this.currentUser = null;
        return Promise.resolve();
    }

    onAuthStateChanged(callback) {
        callback(this.currentUser);
        return () => {}; // unsubscribe function
    }
}

// Helper functions for Firebase operations
window.FirebaseHelper = {
    // Get database reference
    ref: (path) => {
        return window.firebaseApp.database.ref(path);
    },

    // Get data
    get: async (path) => {
        try {
            const snapshot = await window.firebaseApp.database.ref(path).get();
            return snapshot.val();
        } catch (error) {
            console.error('Error getting data:', error);
            return null;
        }
    },

    // Set data
    set: async (path, data) => {
        try {
            await window.firebaseApp.database.ref(path).set(data);
            return true;
        } catch (error) {
            console.error('Error setting data:', error);
            return false;
        }
    },

    // Push data (auto-generate key)
    push: async (path, data) => {
        try {
            const result = await window.firebaseApp.database.ref(path).push(data);
            return result.key;
        } catch (error) {
            console.error('Error pushing data:', error);
            return null;
        }
    },

    // Remove data
    remove: async (path) => {
        try {
            await window.firebaseApp.database.ref(path).remove();
            return true;
        } catch (error) {
            console.error('Error removing data:', error);
            return false;
        }
    },

    // Update data
    update: async (path, data) => {
        try {
            await window.firebaseApp.database.ref(path).set(data);
            return true;
        } catch (error) {
            console.error('Error updating data:', error);
            return false;
        }
    },

    // Auth functions
    signIn: async (email, password) => {
        try {
            const result = await window.firebaseApp.auth.signInWithEmailAndPassword(email, password);
            return result.user;
        } catch (error) {
            console.error('Error signing in:', error);
            throw error;
        }
    },

    signOut: async () => {
        try {
            await window.firebaseApp.auth.signOut();
            return true;
        } catch (error) {
            console.error('Error signing out:', error);
            return false;
        }
    },

    getCurrentUser: () => {
        return window.firebaseApp.auth.currentUser;
    }
};

// Initialize Firebase when the module loads
initializeFirebase();
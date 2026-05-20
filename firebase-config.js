try {
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        databaseURL: "YOUR_DATABASE_URL",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    };

    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();

    const counter = database.ref('visitors');
    counter.on('value', (snapshot) => {
        document.querySelector('view-counter').shadowRoot.querySelector('#count').textContent = snapshot.val();
    });

    counter.transaction((currentValue) => {
        return (currentValue || 0) + 1;
    });
} catch(e) {
    console.warn('Firebase config not set up:', e);
}

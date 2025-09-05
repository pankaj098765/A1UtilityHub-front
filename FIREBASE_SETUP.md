# Firebase Configuration Setup Instructions

This file contains the instructions for setting up Firebase and Firestore for the A1UtilityHub bot data collection.

## 1. Create a Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "a1utilityhub-analytics")
4. Enable or disable Google Analytics (recommended: enable)
5. Choose your analytics account if you enabled it
6. Click "Create project"

## 2. Enable Firestore Database

1. In your Firebase project console, click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for now (you can change security rules later)
4. Select a location for your database (choose closest to your users)
5. Click "Done"

## 3. Get your Firebase Configuration

1. In your Firebase project console, click on the gear icon (Settings) → "Project settings"
2. Scroll down to "Your apps" section
3. Click on the web icon (</>) to add a web app
4. Register your app with a nickname (e.g., "A1UtilityHub Web")
5. Copy the Firebase configuration object

## 4. Update the Firebase Configuration

Replace the placeholder values in `/js/firebase-config.js` with your actual Firebase project credentials:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

## 5. Set up Firestore Security Rules (Optional but Recommended)

In Firestore console, go to "Rules" tab and update the rules based on your security requirements:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents for now
    // You should customize these rules based on your security needs
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 6. Collections that will be created automatically:

- `user_interactions`: Stores user input/output data for each tool usage
- `generated_content`: Stores all generated content (bios, prompts, rewritten text)
- `analytics`: Tracks user behavior, page views, and tool usage statistics
- `user_preferences`: Stores user settings and preferences

## 7. Test the Integration

After updating the configuration:
1. Open your website in a browser
2. Open browser developer tools (F12) → Console tab
3. Use any of the AI tools (Instagram Bio Generator, AI Prompt Generator, Text Rewriter)
4. Check the console for any errors
5. Go to your Firestore console and verify that data is being stored

## 8. Monitoring and Analytics

The system will automatically track:
- Page views and tool usage
- API call performance and errors
- User interactions and generated content
- Copy actions and user behavior

You can view this data in your Firestore console under the respective collections.

## Troubleshooting

If you encounter CORS errors:
1. Make sure your domain is added to Firebase authorized domains
2. Go to Firebase Console → Authentication → Settings → Authorized domains
3. Add your website domain (e.g., a1utilityhub.tech)

If modules are not loading:
- Ensure your website is served over HTTPS (required for ES6 modules)
- Check that all file paths are correct
- Verify Firebase SDK URLs are accessible
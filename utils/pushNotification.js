import admin from 'firebase-admin';
import fs from 'fs';

const serviceAccountData = fs.readFileSync(`private/serviceAccountKey.json`);

const serviceAccount = JSON.parse(serviceAccountData, 'utf-8');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const pushNotification = async (deviceToken, title, body) => {
  const message = {
    notification: {
      title,
      body,
    },
    token: deviceToken,
  };

  try {
    await admin.messaging().send(message);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

export default pushNotification;

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json");
const loki = require("lokijs");

const db = new loki("onlineGame.db");
const rooms = db.addCollection("rooms", { indices: ["roomId"] });

const collections = { rooms };

const init = () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://chain-reaction-messaging.firebaseio.com",
  });
};

/*
{
        data: {
          text: "This is another message from Node.js",
        },
        notification: {
          title: "Notification from Node.js",
          body: "This is third Body",
        },
      },
*/

const sendMessage = async (tokens, data, notification) => {
  if (!tokens || (Array.isArray(tokens) && tokens.length === 0)) {
    // No tokens available
    return false;
  }
  const payload = {};
  if (data) payload.data = data;
  if (notification) payload.notification = notification;
  try {
    const res = await admin.messaging().sendToDevice(tokens, payload, {
      contentAvailable: true,
      priority: "high",
    });
    return res;
  } catch (error) {
    return error;
  }
};

const broadcast = async ({ fromUserId, roomId, type, data, notification }) => {
  try {
    const document = await readItemFromDataBase({
      collection: "rooms",
      key: "roomId",
      value: roomId,
    });
    console.log("document", document);
    if (document) {
      const userIndex = document.users.findIndex(
        (user) => user.userId === fromUserId
      );
      const tokens = [...document.tokens]
      tokens.splice(userIndex, 1);
      console.log("tokens", tokens);
      const messageResponse = await sendMessage(
        tokens,
        {
          type,
          userName: document.users[userIndex].user,
          userId: fromUserId,
          data: JSON.stringify(data),
        },
        notification
      );
      console.log("messageResponse", messageResponse);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

const saveToDataBase = async ({ collection, data }) => {
  return collections[collection].insert(data);
};

const readItemFromDataBase = ({ collection, key, value }) => {
  return collections[collection].findOne({ [key]: value });
};

const updateToDataBase = async ({ collection, data }) => {
  return collections[collection].update(data);
};

const deleteFromDataBase = async ({ collection, key, value }) => {
  return collections[collection]
    .chain()
    .find({ [key]: value })
    .remove();
};
module.exports = {
  init,
  sendMessage,
  broadcast,
  saveToDataBase,
  readItemFromDataBase,
  updateToDataBase,
  deleteFromDataBase,
};

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
  const payload ={};
  if(data)
    payload.data = data;
  if(notification)
  payload.notification = notification

  const res = await admin.messaging().sendToDevice(
    tokens,
    payload,
    {
      contentAvailable: true,
      priority: "high",
    }
  );
  return res;
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

module.exports = {
  init,
  sendMessage,
  saveToDataBase,
  readItemFromDataBase,
  updateToDataBase,
};

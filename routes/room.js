const express = require("express");
const { v4: uuid } = require("uuid");
const router = express.Router();
const { sendMessage } = require("../utils");

const {
  saveToDataBase,
  readItemFromDataBase,
  updateToDataBase,
  deleteFromDataBase,
} = require("../utils");

router.post("/create", async (req, res) => {
  // body params => user: string, userId: string, token: string, roomSize: number
  try {
    const id = uuid();
    const data = await saveToDataBase({
      collection: "rooms",
      data: {
        roomId: id,
        createdBy: req.body.userId,
        tokens: [req.body.token],
        users: [{ user: req.body.user, userId: req.body.userId }],
        roomSize: req.body.roomSize.toString(),
      },
    });
    res.send({
      status: "SUCCESS",
      data: {
        roomId: id,
      },
    });
  } catch (error) {
    res.send({ status: "ERROR", data: error });
  }
});

router.post("/read", async (req, res) => {
  // body params =>  roomId: string
  try {
    const data = await readItemFromDataBase({
      collection: "rooms",
      key: "roomId",
      value: req.body.roomId,
    });
    if (data) res.send({ status: "SUCCESS", data });
    else res.send({ status: "ERROR", data: "No such room found!" });
  } catch (e) {
    console.log("Error", e);
    res.send({ status: "ERROR", data: "Error occured while exit!" });
  }
});

router.post("/join", async (req, res) => {
  // body params => roomId:string, userId: string, token: string, user: string
  try {
    const document = await readItemFromDataBase({
      collection: "rooms",
      key: "roomId",
      value: req.body.roomId,
    });
    if (document) {
      if (document.tokens.length == document.roomSize) {
        // Already all are joined
        res.send({
          status: "ERROR",
          data: "Room is full. Create another room!",
        });
        return;
      }

      document.users.push({ user: req.body.user, userId: req.body.userId });
      let messageResponse;
      messageResponse = await sendMessage(document.tokens, {
        type: "JOINED",
        userName: req.body.user,
        userId: req.body.userId,
        users: JSON.stringify(document.users),
        roomSize: document.roomSize,
      },{
        title:'Wow..! A Friend Accepted Your Invitation',
        body:`${req.body.user} joined the Room.`
      }
      );

      document.tokens.push(req.body.token);
      const data = await updateToDataBase({
        collection: "rooms",
        data: document,
      });

      if (document.tokens.length == document.roomSize) {
        // All are joined
        setTimeout(() => {
          sendMessage(document.tokens, {
            type: "STARTED",
            roomSize: document.roomSize,
            users: JSON.stringify(document.users),
          });
        }, 1000);
      }
      res.send({ status: "SUCCESS", data: messageResponse });
    } else {
      res.send({ status: "ERROR", data: "No such room found!" });
    }
  } catch (error) {
    res.send({ status: "ERROR", data: error });
  }
});

router.post("/exit", async (req, res) => {
  // body params =>  roomId: string, userId: string,
  try {
    const document = await readItemFromDataBase({
      collection: "rooms",
      key: "roomId",
      value: req.body.roomId,
    });
    if (!document) {
      res.send({ status: "ERROR", data: "No such Room found!" });
      return;
    }
    const index = document.users.findIndex(
      (user) => user.userId === req.body.userId
    );
    if (index !== -1) {
      if (document.createdBy === req.body.userId) {
        // If creator exits, room will expire
        // First index is the creator itself, he doesn't need notification
        sendMessage(document.tokens.slice(1), {
          type: "EXPIRED",
        });
        await deleteFromDataBase({
          collection: "rooms",
          key: "roomId",
          value: document.roomId,
        });
      } else {
        // Removes the exited user
        document.tokens.splice(index, 1);
        const [userObj] = document.users.splice(index, 1);
        if (userObj) {
          sendMessage(document.tokens, {
            type: "EXITED",
            userName: userObj.user,
            userId: userObj.userId,
            users: JSON.stringify(document.users),
            roomSize: document.roomSize,
          });
        }
        const data = await updateToDataBase({
          collection: "rooms",
          data: document,
        });
        res.send({ status: "SUCCESS", data });
      }
    } else res.send({ status: "ERROR", data: "No such Room or User found!" });
  } catch (e) {
    console.log("Error", e);
    res.send({ status: "ERROR", data: "Error occured while exit!" });
  }
});

module.exports = router;

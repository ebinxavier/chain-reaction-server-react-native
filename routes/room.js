const express = require("express");
const { v4: uuid } = require("uuid");
const router = express.Router();
const { sendMessage } = require("../utils");

const {
  saveToDataBase,
  readItemFromDataBase,
  updateToDataBase,
} = require("../utils");

router.post("/create", async (req, res) => {
  // body params => user: string, token: string, playersCount: number
  const id = uuid();
  const data = await saveToDataBase({
    collection: "rooms",
    data: {
      roomId: id,
      createdBy: req.body.user,
      tokens: [req.body.token],
      users: [req.body.user],
      playersCount: req.body.playersCount,
    },
  });
  console.log("Data", data);
  setTimeout(()=>{
    sendMessage(
      [req.body.token],
      {data:"This is data"},
      {title:"This is notification"}
      );
      res.send({status:"SUCCESS", roomId: id });
  }, 2000)
});

router.post("/read", async (req, res) => {
  // body params =>  roomId: string
  const data = await readItemFromDataBase({
    collection: "rooms",
    key: "roomId",
    value: req.body.roomId,
  });
  if (data) res.send(data);
  else res.send({ status: "ERROR", details: "No such room found!" });
});

router.post("/join", async (req, res) => {
  // body params => roomId:string, token: string, user: string
  const document = readItemFromDataBase({
    collection: "rooms",
    key: "roomId",
    value: req.body.roomId,
  });
  if (document) {
    if (document.tokens.length === document.playersCount) {
      res.send({
        status: "ERROR",
        details: "Room is full. Create another room!",
      });
      return;
    }
    document.tokens.push(req.body.token);
    document.users.push(req.body.user);
    const data = await updateToDataBase({
      collection: "rooms",
      data: document,
    });
    setTimeout(()=>{
      sendMessage(
        document.tokens,
        {data:"This is data"},
        {title:"This is notification"}
        );
        res.send({status: 'SUCCESS', details: data});
    }, 2000)

  } else {
    res.send({ status: "ERROR", details: "No such room found!" });
  }
});

module.exports = router;

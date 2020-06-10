const express = require("express");
const { v4: uuid } = require("uuid");
const router = express.Router();

const {
  saveToDataBase,
  readItemFromDataBase,
  updateToDataBase,
  sendMessage,
} = require("../utils");

router.post("/broadcastToGroup", async (req, res) => {
  // body params => groupId: string, data: object
  const data = await readItemFromDataBase({
    collection: "rooms",
    key: "roomId",
    value: req.body.roomId,
  });
  if (data && (req.body.data || req.body.notification)) {
    const status = await sendMessage(
      data.tokens,
      req.body.data,
      req.body.notification
    );
    res.send(status);
  } else res.send({ status: "ERROR", details: data ? "Invalid Body params" : "No such document" });
});

module.exports = router;

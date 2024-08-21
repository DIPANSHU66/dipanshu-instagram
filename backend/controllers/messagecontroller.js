const Conversation = require("../Models/conversationmodel");
const Message = require("../Models/Messagemodel");
const { getRecieverSocketid, io } = require("../socket/socket");

const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { textMessage: message } = req.body;

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    // Create new message
    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
    });

    if (newMessage) conversation.messages.push(newMessage._id);
    await Promise.all([conversation.save(), newMessage.save()]);

    const recieversocketid = getRecieverSocketid(receiverId);
    if (recieversocketid) {
      io.to(recieversocketid).emit("newMessage", newMessage);
    }

    return res.status(201).json({
      success: true,
      newMessage,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;

    // Find conversation and populate messages
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");

    if (!conversation) {
      return res.status(200).json({
        success: true,
        messages: [],
      });
    }

    return res.status(200).json({
      success: true,
      messages: conversation.messages,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { receiverId, senderId, _id: messageId } = req.body; // Assuming these are sent in the request body
    console.log(req.body);
    if (!receiverId || !senderId || !messageId) {
      return res
        .status(400)
        .json({ message: "Missing required parameters", success: false });
    }

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      return res
        .status(404)
        .json({ message: "Conversation not found", success: false });
    }

    const messageIndex = conversation.messages.findIndex(
      (msg) => msg._id.toString() === messageId
    );

    if (messageIndex === -1) {
      return res
        .status(404)
        .json({ message: "Message not found", success: false });
    }

    conversation.messages.splice(messageIndex, 1);

    await conversation.save();

    return res
      .status(200)
      .json({ message: "Message deleted successfully", success: true });
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

module.exports = { sendMessage, getMessage, deleteMessage };

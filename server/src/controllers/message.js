
import pool from "../config/db.js";
import { message_Queue } from "../data/queue.js";
import {
  getAllMessage,
  createMessage,
  readByIdMessage,
  updateMessage,
  deleteMessage
} from "../models/userModel.js";
import { publish } from "../utils/redisClient.js";
import { uploadImage } from "../lib/cloudinary.js";
import { getConversationCache, setConversationCache, getRecentMessages } from "../utils/cache.js";
import { v4 as uuidv4 } from 'uuid';

const getOrCreateConversation = async (userId, otherUserId) => {
  const cachedConvId = await getConversationCache(userId, otherUserId);
  if (cachedConvId) return cachedConvId;

  // First, try to find existing conversation without transaction
  const client = await pool.connect();
  try {
    const exist = await client.query(
      `SELECT DISTINCT cp1.conversation_id 
       FROM conversation_participants cp1
       JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
       WHERE cp1.user_id = $1 AND cp2.user_id = $2
       LIMIT 1`,
      [userId, otherUserId]
    );

    if (exist.rows.length > 0) {
      const convId = exist.rows[0].conversation_id;
      await setConversationCache(userId, otherUserId, convId);
      return convId;
    }

    // If not found, create in transaction
    await client.query('BEGIN');
    
    // Double-check in case another process created it
    const existAgain = await client.query(
      `SELECT DISTINCT cp1.conversation_id 
       FROM conversation_participants cp1
       JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
       WHERE cp1.user_id = $1 AND cp2.user_id = $2
       LIMIT 1`,
      [userId, otherUserId]
    );

    let convId;
    if (existAgain.rows.length > 0) {
      convId = existAgain.rows[0].conversation_id;
    } else {
      const newConv = await client.query(
        "INSERT INTO conversations (type) VALUES ($1) RETURNING id",
        ['private']
      );
      convId = newConv.rows[0].id;
      
      await client.query(
        "INSERT INTO conversation_participants (conversation_id, user_id) VALUES ($1,$2),($1,$3)",
        [convId, userId, otherUserId]
      );
    }
    
    await client.query('COMMIT');
    await setConversationCache(userId, otherUserId, convId);
    return convId;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const sendmessage = async (req, res) => {
  try {
    const {
      id,
      conversation_id,
      message,
      receiver_id,
      file,
      file_type,
      file_name
    } = req.body;

    const sender_id = req.user?.id;
    const receiverId = Number(receiver_id || req.params.id);

    if (!sender_id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if ((!message || !message.trim()) && !file) {
      return res.status(400).json({ error: "Message or file required" });
    }

    if (!receiverId) {
      return res.status(400).json({ error: "Receiver required" });
    }

    // Get conversation ID (with caching)
    const convId = conversation_id || 
      await getOrCreateConversation(sender_id, receiverId);

    const messageData = {
      id: id || uuidv4(),
      conversation_id: convId,
      message: message?.trim() || "",
      sender_id,
      receiver_id: receiverId,
      file: file || null,
      file_type: file_type || null,
      file_name: file_name || null,
      created_at: new Date()
    };

    // ✅ Enqueue with priority and deduplication
    await message_Queue.add("send_message", messageData, {
      jobId: messageData.id, // Prevent duplicates
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
      removeOnComplete: 1000,
      removeOnFail: 5000,
      priority: 1 // Lower number = higher priority
    });

    return res.status(200).json({
      success: true,
      message: "Message queued",
      conversation_id: convId,
      temp_id: messageData.id
    });

  } catch (err) {
    console.error("Send message error:", err);
    return res.status(500).json({ 
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Find or create conversation, then fetch messages
export const getmessage = async (req, res) => {
  try {
    const { conversation_id, user_id } = req.body;
    const currentUserId = req.user.id;
    const limit = Number(process.env.MESSAGE_LIMIT || 10);

    if (!currentUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let convId = conversation_id;
    if (!convId && user_id) {
      convId = await getOrCreateConversation(currentUserId, Number(user_id));
    }

    if (!convId) {
      return res.status(200).json({ message: "No conversation", data: [], hasMore: false });
    }

    const cachedMessages = await getRecentMessages(convId, limit);
    if (cachedMessages.length > 0) {
      return res.status(200).json({
        message: "Messages fetched",
        data: cachedMessages.slice(-limit),
        conversation_id: convId,
        hasMore: cachedMessages.length === limit,
      });
    }

    const result = await pool.query(
      "SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT $2",
      [convId, limit]
    );

    const chronologicalMessages = result.rows.reverse();

    return res.status(200).json({
      message: "Messages fetched",
      data: chronologicalMessages,
      conversation_id: convId,
      hasMore: result.rows.length === limit,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: error.message });
  }
};











export const getUsers = async (req, res) => {
  try {
    res.status(200).json({ message: "OK" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const newUser = await createMessage(name, email);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await readByIdMessage(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updatedUser = await updateMessage(name, email, req.params.id);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await deleteMessage(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(deletedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const oldMessages = async (req, res) => {
  try {
    const { conversation_id, cursor } = req.body;
    const limit = 50;
    console.log(cursor);
    if (!conversation_id || !cursor) {
      return res.status(400).json({ message: "Missing conversation_id or cursor" });
    }

    // Fetch 50 messages that were sent BEFORE the cursor timestamp
    const result = await pool.query(
      `SELECT * FROM messages 
       WHERE conversation_id = $1 AND created_at < $2::timestamptz
       ORDER BY created_at DESC 
       LIMIT $3`,
      [conversation_id, cursor, limit]
    );

    // Reverse them so they display chronologically (top-to-bottom) in the UI
    const chronologicalMessages = result.rows.reverse();
    console.log(result.rows.length);
    return res.status(200).json({
      message: "Successfully Loaded messages",
      data: chronologicalMessages,
      hasMore: result.rows.length > 0, // If we got 50, there are probably more
    });
  } catch (error) {
    console.error("Error in oldMessages:", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};





// export {
//     sendmessage,
//     getmessage
// }
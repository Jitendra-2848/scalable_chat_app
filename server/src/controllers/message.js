

import {
  getAllMessage,
  createMessage,
  readByIdMessage,
  updateMessage,
  deleteMessage
} from "../models/userModel.js";


const sendmessage = async(req,res)=>{
    try {
        res.status(200).json({message:"hello from me server >.... 💀💀"});
    } catch (error) {
        console.log(error)
    }
}


const getmessage = async(req,res)=>{
    try {
        res.status(200).json({message:"hello from me server >.... 💀💀"});
    } catch (error) {
        console.log(error)
    }
}











export const getUsers = async (req, res) => {
  try {
    const users = await getAllMessage();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    console.log(req.body)
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











// export {
//     sendmessage,
//     getmessage
// }
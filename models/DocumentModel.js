import User from "./User";

const { default: mongoose } = require("mongoose");

const documentModel = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: User,
  },
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: String,
  ducoment: String,
});

const Documents =
  mongoose.models.Document || mongoose.model("Document", documentModel);
export default Documents;

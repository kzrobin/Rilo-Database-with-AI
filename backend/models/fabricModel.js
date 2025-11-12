const mongoose = require("mongoose");
const { Schema } = mongoose;

const fabricSchema = new Schema(
  {
    fabric_name: {
      type: String,
      required: [true, "Fabric name is required."],
      trim: true,
    },
    material: {
      type: String,
      required: [true, "Material is required."],
      trim: true,
    },
    color: {
      type: String,
      required: [true, "Color is required."],
      trim: true,
    },
  },
  { timestamps: true }
);

const FabricModel = mongoose.model("Fabric", fabricSchema);

module.exports = FabricModel;

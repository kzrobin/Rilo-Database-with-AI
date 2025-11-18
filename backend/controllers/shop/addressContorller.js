const { validationResult } = require("express-validator");
const Address = require("../../models/addressModel");

exports.createAddress = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { address, city, pincode, phone, notes } = req.body;

    const newAddress = await Address.create({
      userId: req.user._id,
      address,
      city,
      pincode,
      phone,
      notes,
    });

    const addresses = await Address.find({ userId: req.user._id });

    res.status(201).json({
      message: "Address added successfully",
      data: addresses,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getUserAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user._id });

    res.status(200).json({
      message: "Addresses fetched successfully",
      data: addresses,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const addressId = req.params.id;

    const updated = await Address.findOneAndUpdate(
      { _id: addressId, userId: req.user._id },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Address not found" });
    }

    const addresses = await Address.find({ userId: req.user._id });
    res.status(200).json({
      message: "Address updated successfully",
      data: addresses,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;

    const deleted = await Address.findOneAndDelete({
      _id: addressId,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Address not found" });
    }

    const addresses = await Address.find({ userId: req.user._id });
    res.status(200).json({
      message: "Address deleted successfully",
      data: addresses,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

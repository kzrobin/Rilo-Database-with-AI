const Fabric = require("../models/fabricModel");

const createFabric = async (req, res) => {
  try {
    const { fabric_name, material, color } = req.body;

    if (!fabric_name || !material || !color) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide fabric name, material, and color.",
      });
    }

    const newFabric = await Fabric.create({
      fabric_name,
      material,
      color,
    });

    res.status(201).json({
      status: "success",
      message: "Fabric created successfully.",
      data: {
        fabric: newFabric,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        status: "fail",
        message: error.message,
      });
    }
    console.error("CREATE FABRIC ERROR:", error);
    res.status(500).json({
      status: "fail",
      message: "An error occurred while creating the fabric.",
    });
  }
};

const getAllFabrics = async (req, res) => {
  try {
    const fabrics = await Fabric.find();

    res.status(200).json({
      status: "success",
      results: fabrics.length,
      data: {
        fabrics,
      },
    });
  } catch (error) {
    console.error("GET ALL FABRICS ERROR:", error);
    res.status(500).json({
      status: "fail",
      message: "An error occurred while fetching fabrics.",
    });
  }
};

const getFabricById = async (req, res) => {
  try {
    const fabric = await Fabric.findById(req.params.id);

    if (!fabric) {
      return res.status(404).json({
        status: "fail",
        message: "No fabric found with that ID.",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        fabric,
      },
    });
  } catch (error) {
    console.error("GET FABRIC BY ID ERROR:", error);
    res.status(500).json({
      status: "fail",
      message: "An error occurred while fetching the fabric.",
    });
  }
};

const updateFabric = async (req, res) => {
  try {
    const updatedFabric = await Fabric.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedFabric) {
      return res.status(404).json({
        status: "fail",
        message: "No fabric found with that ID to update.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Fabric updated successfully.",
      data: {
        fabric: updatedFabric,
      },
    });
  } catch (error) {
    console.error("UPDATE FABRIC ERROR:", error);
    res.status(500).json({
      status: "fail",
      message: "An error occurred while updating the fabric.",
    });
  }
};

const deleteFabric = async (req, res) => {
  try {
    const fabric = await Fabric.findByIdAndDelete(req.params.id);

    if (!fabric) {
      return res.status(404).json({
        status: "fail",
        message: "No fabric found with that ID to delete.",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    console.error("DELETE FABRIC ERROR:", error);
    res.status(500).json({
      status: "fail",
      message: "An error occurred while deleting the fabric.",
    });
  }
};

module.exports = {
  createFabric,
  getAllFabrics,
  getFabricById,
  updateFabric,
  deleteFabric,
};

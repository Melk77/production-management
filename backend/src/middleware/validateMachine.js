const validateMachine = (req, res, next) => {
  const { name, type, status, location, purchase_date } = req.body;

  // Required fields
  if (!name || name.trim() === "") {
    return res.status(400).json({
      message: "Machine name is required",
    });
  }

  if (!type || type.trim() === "") {
    return res.status(400).json({
      message: "Machine type is required",
    });
  }

  // Validate status
  const allowedStatuses = ["available", "in_use", "under_maintenance"];

  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: `Invalid machine status. Allowed values: ${allowedStatuses.join(", ")}`,
    });
  }

  // Validate purchase date
  if (purchase_date) {
    const date = new Date(purchase_date);

    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({
        message: "Invalid purchase date",
      });
    }
  }

  next();
};

module.exports = {
  validateMachine,
};

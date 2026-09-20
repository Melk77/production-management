const bcrypt = require("bcrypt");

async function generate() {
  console.log("Admin:", await bcrypt.hash("Admin@123", 10));
  console.log("Manager:", await bcrypt.hash("Manager@123", 10));
  console.log("Operator:", await bcrypt.hash("Operator@123", 10));
  console.log("Inspector:", await bcrypt.hash("Inspector@123", 10));
  console.log("Procurement:", await bcrypt.hash("Procurement@123", 10));
  console.log("Warehouse:", await bcrypt.hash("Warehouse@123", 10));
}

generate();

const mongoose = require("mongoose");
require("dotenv").config();
const connectdb = async () => {
try { await mongoose.connect(process.env.MONGO_URL);console.log("mongodb connected SucessFully.")} 
catch (e) { console.log(e);}};
module.exports = connectdb;

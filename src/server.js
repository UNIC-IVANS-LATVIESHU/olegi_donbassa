const dotenv = require("dotenv");
var moodle_client = require("moodle-client");
dotenv.config();
moodle_client
  .init({
    wwwroot: process.env.MOODLE_URL, //Entering your modle url
    token: process.env.MOODLE_TOKEN, //Entering your token
    // ! FIXME: This part of code should be implemented when we'll have access to the moodle.status
    // moodle_status:md_client_using.moodle_status,
  })
  // Checking for an possible errors with error message
  .catch(function (err) {
    console.log("Unable to initialize the client: " + err);
  });

const app = require("./app");

//Handling uncaught exceptions with further shutdown
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

// ? TODO: Move the server on your port
const port = process.env.PORT || 3030;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Handling unhandled rejections with further shutdown
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = server;

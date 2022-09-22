var bodyParser = require("body-parser");
var express = require("express");
var app = express();
var moodleRouter = require("./moodleRouter");

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// This middleware used to check the integration settings before every request
app.use((req, res, next) => {
  if (
    process.env.MOODLE_TOKEN == undefined ||
    process.env.MOODLE_URL == undefined ||
    process.env.MOODLE_TOKEN == "" ||
    process.env.MOODLE_URL == ""
  ) {
    res.status(500).json({
      status: false,
      message:
        "One or more integration settings are empty. Please complete all moodle integration settings",
    });
    return;
  } else {
    next();
  }
});

app.use("/", moodleRouter);

module.exports = app;

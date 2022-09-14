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

app.use((req, res, next) => {
  if (process.env.MOODLE_TOKEN === "" || process.env.MOODLE_URL === "") {
    next(
      JSON.stringify({
        status: false,
        message:
          "One or more integration settings are empty. Please complete all moodle integration settings",
      })
    );
  } else {
    next();
  }
});

app.use("/", moodleRouter);

module.exports = app;

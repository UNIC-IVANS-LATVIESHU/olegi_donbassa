const express = require("express");
var axios = require("axios");
require("dotenv").config();
const router = express.Router();

router.route("/createuser").post(
  (createUser = (req, res, next) => {
    let theUrl =
      "/webservice/rest/server.php?wstoken=" +
      process.env.MOODLE_TOKEN +
      "&wsfunction=core_user_get_users&criteria[0][key]=email&criteria[0][value]=" +
      encodeURI(req.body.user["email"]) +
      "&moodlewsrestformat=json";

    let result = "";
    axios
      .get(process.env.MOODLE_URL + theUrl)
      .then((res) => {
        result = res;
        console.log(res);
      })
      .catch((error) => {
        result = error;
        console.log(error);
      });

    //Checking for amount of the users. And if there is more than 0 user, then send the first ones id in a string
    if (user_result.length < 1) {
      checkexist = {
        status: "success",
        exist: false,
      };
    } else {
      checkexist = {
        status: "success",
        exist: true,
        user_id: result.users[0].id,
      };
    }

    if (checkexist.status) {
      if (checkexist.exist) {
        res.send(
          JSON.stringify({
            status: "success",
            new_user: false,
            user_id: checkexist.user_id,
            message: "User Already Exist in moodle",
          })
        );
      } else {
        //Creating a link for a moodle webservice
        theUrl =
          "/webservice/rest/server.php?wstoken=" + process.env.MOODLE_TOKEN;
        theUrl +=
          "&wsfunction=core_user_create_users&users[0][username]=" +
          encodeURI(req.user["email"].toLowerCase());
        theUrl +=
          "&users[0][password]=" +
          encodeURI(req.user["password"]) +
          "&users[0][email]=" +
          encodeURI(req.user["email"]);
        theUrl +=
          "&users[0][firstname]=" +
          encodeURI(req.user["name"]) +
          "&users[0][lastname]=" +
          encodeURI(req.user["last"]);
        theUrl +=
          "&users[0][customfields][0][type]=programid&users[0][customfields][0][value]=IFF";
        theUrl += "&moodlewsrestformat=json";
        // Preparing result with all users data taken from a moodle
        axios
          .get(process.env.MOODLE_URL + theUrl)
          .then((res) => {
            result = res.data;
          })
          .catch((error) => {
            result = error;
          });
        //Checking for an error while creating a user with error detecting algorithm. If there is no error => creating a user
        if (result) {
          if (result.exception) {
            res.send(
              JSON.stringify({
                status: "error",
                message: `Error on Creating user: ${result.errorcode}`,
              })
            );
          } else {
            moodle_user_id = result[0].id;
            res.send(
              JSON.stringify({
                status: "success",
                new_user: true,
                user_id: moodle_user_id,
                message: "User created",
              })
            );
          }
        } else {
          res.send(
            JSON.stringify({
              status: "error",
              message: "Error on creating the user",
            })
          );
        }
      }
    } else {
      res.send(
        JSON.stringify({
          status: "error",
          message: checkexist.message,
        })
      );
    }
  })
);

module.exports = router;

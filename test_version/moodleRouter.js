var express = require("express");
var axios = require("axios");
require("dotenv").config();
var router = express.Router();

router.route("/createuser").post(
  (createUser = (req, res, next) => {
    let theUrl =
      "/webservice/rest/server.php?wstoken=" +
      "0027fd789e4fb844c72e096249d9a6b2" + // ! TODO: TAKE DATA FROM config.env
      "&wsfunction=core_user_get_users&criteria[0][key]=email&criteria[0][value]=" +
      encodeURI(req.body.user["email"]) +
      "&moodlewsrestformat=json";

    console.log("1 STEP - SUCCESSFULL! ✅");
    axios
      .get("https://mdl.webdevteam.unic.ac.cy" + theUrl) // ! TODO: TAKE DATA FROM config.env
      .then((result) => {
        console.log("2 STEP - SUCCESSFULL! ✅");

        if (result.data.length < 1) {
          console.log("2.5 STEP - SUCCESSFULL! ✅");
          checkexist = {
            status: "success",
            exist: false,
          };
        } else {
          console.log("2.5 STEP - NOT SUCCESSFULL! 💥");
          checkexist = {
            status: "success",
            exist: true,
            user_id: result.data.users[0].id,
          };
        }

        if (checkexist.status) {
          if (checkexist.exist) {
            console.log("3 STEP - SUCCESSFULL! ✅");
            res.send(
              JSON.stringify({
                status: "success",
                new_user: false,
                user_id: checkexist.user_id,
                message: "User Already Exist in moodle",
              })
            );
          } else {
            console.log("3 STEP - NOT SUCCESSFULL! 💥");
            //Creating a link for a moodle webservice
            theUrl =
              "/webservice/rest/server.php?wstoken=" +
              "0027fd789e4fb844c72e096249d9a6b2"; // ! TODO: TAKE DATA FROM config.env
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
            // axios
            //   .get("https://mdl.webdevteam.unic.ac.cy" + theUrl) // ! TODO: TAKE DATA FROM config.env
            //   .then((main_result) => {
            //     if (main_result) {
            //       if (main_result.exception) {
            //         res.send(
            //           JSON.stringify({
            //             status: "error",
            //             message: `Error on Creating user: ${main_result.errorcode}`,
            //           })
            //         );
            //       } else {
            //         moodle_user_id = main_result.data.user[0].id;
            //         res.send(
            //           JSON.stringify({
            //             status: "success",
            //             new_user: true,
            //             user_id: moodle_user_id,
            //             message: "User created",
            //           })
            //         );
            //       }
            //     } else {
            //       res.send(
            //         JSON.stringify({
            //           status: "error",
            //           message: "Error on creating the user",
            //         })
            //       );
            //     }
            //   })
            //   .catch((error) => {
            //     return error;
            //   });
            //Checking for an error while creating a user with error detecting algorithm. If there is no error => creating a user
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
      .catch((error) => {
        return error;
      });
  })
);

module.exports = router;

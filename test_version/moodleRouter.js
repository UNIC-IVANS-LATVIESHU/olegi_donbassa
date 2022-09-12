var express = require("express");
var axios = require("axios");
var router = express.Router();

router.route("/createuser").post(
  (createUser = (req, res) => {
    let theUrl =
      "/webservice/rest/server.php?wstoken=" +
      "0027fd789e4fb844c72e096249d9a6b2" + // ! TODO: TAKE DATA FROM config.env
      "&wsfunction=core_user_get_users&criteria[0][key]=email&criteria[0][value]=" +
      encodeURI(req.body.user["email"]) +
      "&moodlewsrestformat=json";

    axios
      .get("https://mdl.webdevteam.unic.ac.cy" + theUrl) // ! TODO: TAKE DATA FROM config.env
      .then((result) => {
        if (result.data.users.length < 1) {
          checkexist = {
            status: "success",
            exist: false,
          };
        } else {
          checkexist = {
            status: "success",
            exist: true,
            user_id: result.data.users[0].id,
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
            var newUrl =
              "/webservice/rest/server.php?wstoken=" +
              "0027fd789e4fb844c72e096249d9a6b2"; // ! TODO: TAKE DATA FROM config.env
            newUrl +=
              "&wsfunction=core_user_create_users&users[0][username]=" +
              encodeURI(req.body.user["email"].toLowerCase());
            newUrl +=
              "&users[0][password]=" +
              encodeURI(req.body.user["password"]) +
              "&users[0][email]=" +
              encodeURI(req.body.user["email"]);
            newUrl +=
              "&users[0][firstname]=" +
              encodeURI(req.body.user["name"]) +
              "&users[0][lastname]=" +
              encodeURI(req.body.user["last"]);
            newUrl +=
              "&users[0][customfields][0][type]=programid&users[0][customfields][0][value]=IFF";
            newUrl += "&moodlewsrestformat=json";

            axios
              .get("https://mdl.webdevteam.unic.ac.cy" + newUrl) // ! TODO: TAKE DATA FROM config.env
              .then((main_result) => {
                if (main_result.data.exception) {
                  res.send(
                    JSON.stringify({
                      status: "error",
                      message: `Error on Creating user: ${main_result.errorcode}`,
                    })
                  );
                } else {
                  // ? FIXME: It does not send any response back
                  res.send(
                    JSON.stringify({
                      status: "success",
                      new_user: true,
                      user_id: main_result.data[0].id,
                      message: "User created",
                    })
                  );
                }
              })
              .catch((error) => {
                if (error.response) {
                  // The request was made and the server responded with a status code
                  // that falls out of the range of 2xx
                  console.log(error.response.data);
                  console.log(error.response.status);
                  console.log(error.response.headers);
                } else if (error.request) {
                  // The request was made but no response was received
                  // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                  // http.ClientRequest in node.js
                  console.log(error.request);
                } else {
                  // Something happened in setting up the request that triggered an Error
                  console.log("Error", error.message);
                }
                console.log(error);
              });

            //Checking for an error while creating a user with error detecting algorithm. If there is no error => creating a user
          }
        } else {
          res.send(
            JSON.stringify({
              status: "error",
              message: checkexist,
            })
          );
        }
      })
      .catch((error) => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log("Error", error.message);
        }
        console.log(error);
      });
  })
);

module.exports = router;

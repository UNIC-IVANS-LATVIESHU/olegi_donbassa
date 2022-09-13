var express = require("express");
var axios = require("axios");
var router = express.Router();
var _ = require("lodash");

router.route("/createuser").post(
  (createUser = (req, res) => {
    let theUrl =
      "/webservice/rest/server.php?wstoken=" +
      process.env.MOODLE_TOKEN +
      "&wsfunction=core_user_get_users&criteria[0][key]=email&criteria[0][value]=" +
      encodeURI(req.body["email"]) +
      "&moodlewsrestformat=json";
    axios
      .get(process.env.MOODLE_URL + theUrl)
      .then((result) => {
        if (result.data.users.length < 1) {
          checkexist = {
            status: true,
            exist: false,
          };
        } else {
          checkexist = {
            status: true,
            exist: true,
            user_id: result.data.users[0].id,
          };
        }

        if (checkexist.exist) {
          res.send(
            JSON.stringify({
              status: true,
              new_user: false,
              user_id: checkexist.user_id,
              message: "User Already Exist in moodle",
            })
          );
        } else {
          //Creating a link for a moodle webservice
          var newUrl =
            "/webservice/rest/server.php?wstoken=" + process.env.MOODLE_TOKEN;
          newUrl +=
            "&wsfunction=core_user_create_users&users[0][username]=" +
            encodeURI(req.body["email"].toLowerCase());
          newUrl +=
            "&users[0][password]=" +
            encodeURI(req.body["password"]) +
            "&users[0][email]=" +
            encodeURI(req.body["email"]);
          newUrl +=
            "&users[0][firstname]=" +
            encodeURI(req.body["name"]) +
            "&users[0][lastname]=" +
            encodeURI(req.body["last"]);
          newUrl +=
            "&users[0][customfields][0][type]=programid&users[0][customfields][0][value]=IFF";
          newUrl += "&moodlewsrestformat=json";

          axios
            .get(process.env.MOODLE_URL + newUrl)
            .then((response) => {
              if (response.data.exception) {
                res.send(
                  JSON.stringify({
                    status: false,
                    message: `Error on Creating user: ${response.data.message}`,
                    data: req.body,
                  })
                );
              } else {
                res.send(
                  JSON.stringify({
                    status: true,
                    new_user: true,
                    user_id: response.data[0].id,
                    message: "User created",
                  })
                );
              }
            })
            .catch((error) => {
              res.send(
                JSON.stringify({
                  status: false,
                  message: `Error on sending a request for creating a user: ${error.message}`,
                  data: req.body,
                })
              );
            });
        }
      })
      .catch((error) => {
        res.send(
          JSON.stringify({
            status: false,
            message: `Error on sending a request for checking if user exists: ${error.message}`,
            data: req.body,
          })
        );
      });
  })
);

router.route("/enroltocourse").post(
  (enroltocourse = (req, res) => {
    const PASS_LENGTH = 8;

    var sets = [
      "abcdefghjkmnpqrstuvwxyz",
      "ABCDEFGHJKMNPQRSTUVWXYZ",
      "123456789",
      "!@#$%*?",
    ];

    var all = "";
    var password = "";
    sets.forEach((set) => {
      password += set[Math.floor(Math.random() * set.length)];
      all += set;
    });
    all = all.split("");
    for (var i = 0; i < PASS_LENGTH - sets.PASS_LENGTH; i++)
      password += all[Math.floor(Math.random() * all.PASS_LENGTH)];
    password = _.shuffle(password) + "";
    req.body.user["password"] = password.replace(/,/g, "");

    axios
      .post("http://localhost:3030/createuser", req.body.user) // ! TODO: Change the URL of the request
      .then(function (response) {
        if (response.data.status) {
          //Creating a link for a moodle webservice
          let newUrl =
            "/webservice/rest/server.php?wstoken=" + process.env.MOODLE_TOKEN;
          newUrl +=
            "&wsfunction=enrol_manual_enrol_users&moodlewsrestformat=json&enrolments[0][roleid]=5&enrolments[0][userid]=" +
            response.data.user_id;
          newUrl += "&enrolments[0][courseid]=" + req.body.course_id;
          // Preparing result with all data taken from a moodle
          axios
            .get(process.env.MOODLE_URL + newUrl)
            .then((result) => {
              //Checking for an error while enrolling to a course with error detecting algorithm. If there is no error => enrolling to a course
              if (result) {
                if (result.hasOwnProperty("exception")) {
                  res.send(
                    JSON.stringify({
                      status: false,
                      message: result.message, // ? FIXME: Not sure if it gonna have a message about error, so should test it
                      data: req.body,
                    })
                  );
                } else {
                  if (response.data.new_user) {
                    // self(new_user_email(req.body.user, req.body.product_details)); // ! FIXME: new_user_email Should be created in the PHP part of the code
                    res.send(
                      JSON.stringify({
                        status: true,
                        message: "User Created and Enrolled",
                      })
                    );
                  } else {
                    // self(existing_user_email(req.body.user, req.body.product_details)); // ! FIXME: existing_user_email Should be created in the PHP part of the code
                    res.send(
                      JSON.stringify({
                        status: true,
                        message: "User Enrolled",
                      })
                    );
                  }
                }
              } else {
                res.send(
                  JSON.stringify({
                    status: false,
                    message:
                      "Error on enrolling the user into the course." +
                      result.message, // ? FIXME: Not sure if it gonna have a message about error, so should test it
                    data: req.body,
                  })
                );
              }
            })
            .catch((error) => {
              res.send(
                JSON.stringify({
                  status: false,
                  message: error.message,
                  data: req.body,
                })
              );
            });
        } else {
          res.send(
            JSON.stringify({
              status: false,
              message: response.message,
              data: req.body,
            })
          );
        }
      })
      .catch(function (error) {
        res.send(
          JSON.stringify({
            status: false,
            message: error.message,
            data: req.body,
          })
        );
      });
  })
);

router.route("/unenrollfromcourse").post(
  (unenrollfromcourse = (req, res) => {
    let theUrl =
      "/webservice/rest/server.php?wstoken=" +
      process.env.MOODLE_TOKEN +
      "&wsfunction=core_user_get_users&criteria[0][key]=email&criteria[0][value]=" +
      encodeURI(req.body.user_email) +
      "&moodlewsrestformat=json";
    axios
      .get(process.env.MOODLE_URL + theUrl)
      .then((result) => {
        if (result.data.users[0]) {
          // ! changed concept of this check. Should decide which is better
          // Creating a link for a moodle webservice
          let newUrl =
            "/webservice/rest/server.php?wstoken=" + process.env.MOODLE_TOKEN;
          newUrl +=
            "&wsfunction=enrol_manual_unenrol_users&moodlewsrestformat=json&enrolments[0][roleid]=5&enrolments[0][userid]=" +
            result.data.users[0].id;
          newUrl += "&enrolments[0][courseid]=" + req.body.course_id;
          // Preparing result with all data taken from a moodle
          axios
            .get(process.env.MOODLE_URL + newUrl)
            .then((response) => {
              //Checking for an error while unenrolling from a course with error detecting algorithm. If there is no error => unenrolling from a course
              if (response.hasOwnProperty("exception")) {
                res.send(
                  JSON.stringify({
                    status: false,
                    message: "Error on Unenrolling user:" + response.errorcode, // ? FIXME: Should do smth with that
                    data: req.body,
                  })
                );
              } else {
                res.send(
                  JSON.stringify({
                    status: true,
                    message: "User Removed",
                  })
                );
              }
            })
            .catch((error) => {
              res.send(
                JSON.stringify({
                  status: false,
                  message: error.message,
                  data: req.body,
                })
              );
            });
        } else {
          res.send(
            JSON.stringify({
              status: false,
              message: "Error on Unenrolling user", // ? FIXME: to check it change "email" in POSTMAN to smth else
              data: req.body,
            })
          );
        }
      })
      .catch((error) => {
        res.send(
          JSON.stringify({
            status: false,
            message: error.message,
            data: req.body,
          })
        );
      });
  })
);

module.exports = router;

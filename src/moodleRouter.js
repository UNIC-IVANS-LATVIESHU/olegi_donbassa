var express = require("express");
var axios = require("axios");
var router = express.Router();
var _ = require("lodash");

/** This router creates user if he is still not registered
 * @param  {string} req.body.email Contains email of the user that should be created on moodle
 * @param  {string} req.body.password Contains password of the user that should be created on moodle
 * @param  {string} req.body.name Contains first name of the user that should be created on moodle
 * @param  {string} req.body.last Contains last name of the user that should be created on moodle
 * @return {JSON} return conditions of request: success or false
 */
router.route("/createuser").post(function (req, res) {
  //Creating a link for a moodle webservice to check if user exists
  let theUrl =
    "/webservice/rest/server.php?wstoken=" +
    process.env.MOODLE_TOKEN +
    "&wsfunction=core_user_get_users&criteria[0][key]=email&criteria[0][value]=" +
    encodeURI(req.body["email"]) +
    "&moodlewsrestformat=json";

  //Sending a request to a moodle to get a response with corresponding information
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
        res.status(200).send(
          JSON.stringify({
            status: true,
            new_user: false,
            user_id: checkexist.user_id,
            message: "User Already Exist in moodle",
          })
        );
      } else {
        //Creating a link for a moodle webservice to create a user
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

        //Sending a request to a moodle to get a response with corresponding information
        axios
          .get(process.env.MOODLE_URL + newUrl)
          .then((response) => {
            if (response.data.hasOwnProperty("exception")) {
              res.status(400).send(
                JSON.stringify({
                  status: false,
                  message: `Error on Creating user: ${response.data.message}`,
                  data: req.body,
                })
              );
            } else {
              res.status(201).send(
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
            res.status(400).send(
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
      res.status(400).send(
        JSON.stringify({
          status: false,
          message: `Error on sending a request for checking if user exists: ${error.message}`,
          data: req.body,
        })
      );
    });
});

/** This router creates user if he is still not registered and enrolles a user to a corresponding course
 * @param  {Object} req.body.user Contains all the info about the user that should be created and/or enrolled to course
 * @param  {number} req.body.course_id Contains id of the course that should be enrolled
 * @param  {Object} product_details Contains information about product (product_sku, prod_dep, product_name, etc.) that will be used in email
 * @return {JSON} return conditions of request: success or false
 */
router.route("/enrolltocourse").post(function (req, res) {
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
  for (var i = 0; i < PASS_LENGTH - sets.length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  password = _.shuffle(password) + "";
  req.body.user["password"] = password.replace(/,/g, "");

  //Sending a request to a create user api to get a response with corresponding information
  axios
    .post("http://127.0.0.1:3030/createuser", req.body.user) // ! TODO: Change the URL of the request
    .then(function (response) {
      if (response.data.status) {
        //Creating a link for a moodle webservice to enroll user to a course
        let newUrl =
          "/webservice/rest/server.php?wstoken=" + process.env.MOODLE_TOKEN;
        newUrl +=
          "&wsfunction=enrol_manual_enrol_users&moodlewsrestformat=json&enrolments[0][roleid]=5&enrolments[0][userid]=" +
          response.data.user_id;
        newUrl += "&enrolments[0][courseid]=" + req.body.course_id;

        //Sending a request to a moodle to get a response with corresponding information
        axios
          .get(process.env.MOODLE_URL + newUrl)
          .then((result) => {
            //Checking for an error while enrolling to a course with error detecting algorithm. If there is no error => enrolling to a course
            if (result.data != undefined) {
              res.status(400).send(
                JSON.stringify({
                  status: false,
                  message: result.data.message,
                  data: req.body,
                })
              );
            } else {
              if (response.data.new_user) {
                // self(new_user_email(req.body.user, req.body.product_details)); // ! FIXME: new_user_email Should be created in the PHP part of the code
                res.status(201).send(
                  JSON.stringify({
                    status: true,
                    message: "User Created and Enrolled",
                  })
                );
              } else {
                // self(existing_user_email(req.body.user, req.body.product_details)); // ! FIXME: existing_user_email Should be created in the PHP part of the code
                res.status(200).send(
                  JSON.stringify({
                    status: true,
                    message: "User Enrolled",
                  })
                );
              }
            }
          })
          .catch((result) => {
            res.status(400).send(
              JSON.stringify({
                status: false,
                message: `Error on sending a request for enrolling user to a course: ${result.data.message}`,
                data: req.body,
              })
            );
          });
      } else {
        res.status(400).send(
          JSON.stringify({
            status: false,
            message: response.data.message,
            data: req.body,
          })
        );
      }
    })
    .catch(function (error) {
      res.status(400).send(
        JSON.stringify({
          status: false,
          message: `Error on sending a /createuser request: ${error.message}`,
          data: req.body,
        })
      );
    });
});

/** This router unenrolles a user from a corresponding course
 * @param  {string} req.body.user_email Contains email of the user that is going to be unenrolled from course
 * @param  {integer} req.body.course_id Contains id of the course that is going to unenroll user from
 * @return {JSON} return conditions of request: success or false
 */
router.route("/unenrollfromcourse").post(function (req, res) {
  //Creating a link for a moodle webservice to check if user exists
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
        //Creating a link for a moodle webservice to unenroll user to a course
        let newUrl =
          "/webservice/rest/server.php?wstoken=" + process.env.MOODLE_TOKEN;
        newUrl +=
          "&wsfunction=enrol_manual_unenrol_users&moodlewsrestformat=json&enrolments[0][roleid]=5&enrolments[0][userid]=" +
          result.data.users[0].id;
        newUrl += "&enrolments[0][courseid]=" + req.body.course_id;

        //Sending a request to a moodle to get a response with corresponding information
        axios
          .get(process.env.MOODLE_URL + newUrl)
          .then((response) => {
            //Checking for an error while unenrolling from a course with error detecting algorithm. If there is no error => unenrolling from a course
            if (response.data != undefined) {
              res.status(400).send(
                JSON.stringify({
                  status: false,
                  message: "Error on Unenrolling user:" + response.data.message, // ? FIXME: Not sure if it gonna have a message about error, so should test it
                  data: req.body,
                })
              );
            } else {
              res.status(200).send(
                JSON.stringify({
                  status: true,
                  message: "User Removed",
                })
              );
            }
          })
          .catch((error) => {
            res.status(400).send(
              JSON.stringify({
                status: false,
                message: `Error on sending a request for unenrolling user to a course: ${error.message}`,
                data: req.body,
              })
            );
          });
      } else {
        res.status(404).send(
          JSON.stringify({
            status: false,
            message: `User is not found.`,
            data: req.body,
          })
        );
      }
    })
    .catch((error) => {
      res.status(400).send(
        JSON.stringify({
          status: false,
          message: `Error on sending a request for checking if user exists: ${error.message}`,
          data: req.body,
        })
      );
    });
});

module.exports = router;

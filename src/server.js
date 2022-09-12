// Installed three external libraries "lodash", "xmlhttprequest" and "moodle-client", "express" with "cookie-parser"
// var cookieParser = require("cookie-parser"); // middleware
var moodle_client = require("moodle-client");
var _ = require("lodash");
var axios = require("axios");
var bodyParser = require("body-parser");
var express = require("express");
var app = express();

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// This class contains constructor with all moodle information
class md_client {
  // This constructor contains all moodle information
  constructor() {
    this.moodle_url = "https://mdl.webdevteam.unic.ac.cy";
    this.moodle_token = "0027fd789e4fb844c72e096249d9a6b2";
    // ! FIXME: This part of code should be implemented when we'll have access to the moodle.status
    // this.moodle_status = get_option('shortcourses_custom_moodle_status');
  }
}

const md_client_using = new md_client();

moodle_client
  .init({
    wwwroot: md_client_using.moodle_url, //Entering your modle url
    token: md_client_using.moodle_token, //Entering your token
    // ! FIXME: This part of code should be implemented when we'll have access to the moodle.status
    // moodle_status:md_client_using.moodle_status,
  })
  // Checking for an possible errors with error message
  .catch(function (err) {
    console.log("Unable to initialize the client: " + err);
  });

/** PHP function that was implemented in NodeJS. Checks if Object is empty.
 * @param  {Object} object Object that is gonna be checked
 * @return {boolean} return conditions of object(if empty = true, else => false)
 */
function isEmpty(object) {
  // Not http
  return Object.keys(object).length === 0;
}

// ? FIXME:  Delete this line of code if http will work
/** This function creates a GET request to the moodle
 * @param  {String} theUrl Contains the path for the link
 * @return {Object} That contains request data
 */

//assynchronous function (promises)
function getParams(firstUrl, secondUrl, callback) {
  const theUrl =
    md_client_using.moodle_url +
    firstUrl +
    md_client_using.moodle_token +
    secondUrl;
  // GET request
  axios
    .get(theUrl)
    .then((res) => {
      return callback(res.data);
    })
    .catch((error) => {
      return callback(error);
    });
}

/**  This function checks if settings was integrated
 * @return String JSON Object that contains information about condition of the settings
 */
function checkintegrationsettings() {
  // Not http
  // ******************************************
  // TODO: This part of code should be implemented when we'll have access to the moodle.status
  // Checking if moodle status contains "yes"
  // if (_.isEqual(md_client_using.moodle_status, "yes") === 0) {
  // ******************************************

  // Checking if either of token or url doesn't contain any information
  if (
    isEmpty(md_client_using.moodle_token) ||
    isEmpty(md_client_using.moodle_url)
  ) {
    return JSON.stringify({
      status: "error",
      message:
        "One or more integration settings are empty. Please complete all moodle integration settings",
    });
  } else {
    return JSON.stringify({
      status: "success",
    });
  }
  // ******************************************
  // TODO: This part of code should be implemented when we'll have access to the moodle.status
  // } else {
  //   return JSON.stringify({
  //     status: "error",
  //     message: "Service is disabled",
  //   });
  // }
  // ******************************************
}

/** This function generates a random password. This function requires "lodash" library
 * @param  {number} length=8 The length of the password to be generated
 * @param  {boolean} add_dashes=false This parameter selects whether the password should be separated by a sign - or not
 * @param  {string} available_sets="luds" This string selects which characters the password should include
 * @return {string} Returns generated random password
 */
function random_str(length = 8, add_dashes = false, available_sets = "luds") {
  // Not http
  var sets = [];
  if (available_sets.indexOf("l") >= 0) {
    sets.push("abcdefghjkmnpqrstuvwxyz");
  }
  if (available_sets.indexOf("u") >= 0) {
    sets.push("ABCDEFGHJKMNPQRSTUVWXYZ");
  }
  if (available_sets.indexOf("d") >= 0) {
    sets.push("123456789");
  }
  if (available_sets.indexOf("s") >= 0) {
    sets.push("!@#$%*?");
  }
  var all = "";
  var password = "";
  sets.forEach((set) => {
    password += set[Math.floor(Math.random() * set.length)];
    all += set;
  });
  all = all.split("");
  for (var i = 0; i < length - sets.length; i++)
    password += all[Math.floor(Math.random() * all.length)];
  password = _.shuffle(password) + "";
  password = password.replace(/,/g, "");
  if (!add_dashes) return password;
  var dash_len = Math.floor(Math.sqrt(length));
  var dash_str = "";
  while (password.length > dash_len) {
    dash_str += password.substr(0, dash_len) + "-";
    password = password.substr(dash_len);
  }
  dash_str += password;
  return dash_str;
}

app.post("/createuser", function (req, res) {
  getParams(firstParams, secondParams, function (err, result) {
    // // POST request
    // let status = JSON.parse(checkintegrationsettings());
    // // If status does not contain any information send an error
    // if (!status) {
    //   res.send(
    //     JSON.stringify({
    //       status: error,
    //       message: "Service disabled or not properly configured!",
    //     })
    //   );

    // } else {

    // Check if user exists
    let firstParams = "/webservice/rest/server.php?wstoken=";
    let secondParams =
      "&wsfunction=core_user_get_users&criteria[0][key]=email&criteria[0][value]=" +
      encodeURI(req.body.user["email"]) +
      "&moodlewsrestformat=json";
    //!
    // Preparing result with all users data taken from a moodle
    // let result = getParams(firstParams, secondParams);
    // !

    //Checking for amount of the users. And if there is more than 0 user, then send the first ones id in a string
    if (result.users.length < 1) {
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
        firstParams = "/webservice/rest/server.php?wstoken=";
        secondParams =
          "&wsfunction=core_user_create_users&users[0][username]=" +
          encodeURI(req.user["email"].toLowerCase());
        secondParams +=
          "&users[0][password]=" +
          encodeURI(req.user["password"]) +
          "&users[0][email]=" +
          encodeURI(req.user["email"]);
        secondParams +=
          "&users[0][firstname]=" +
          encodeURI(req.user["name"]) +
          "&users[0][lastname]=" +
          encodeURI(req.user["last"]);
        secondParams +=
          "&users[0][customfields][0][type]=programid&users[0][customfields][0][value]=IFF";
        secondParams += "&moodlewsrestformat=json";
        // Preparing result with all users data taken from a moodle
        let result = JSON.parse(getParams(firstParams, secondParams));
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
    // }
  });
});

app.post("/enroltocourse", function (req, res) {
  let status = JSON.parse(checkintegrationsettings());
  if (!status) {
    res.send(
      JSON.stringify({
        status: "error",
        message: "Service disabled or not properly configured!",
      })
    );
  } else {
    // Creates a random password for the user
    req.user["password"] = random_str();

    user_status = JSON.parse(
      axios
        .post("localhost:3030/createuser", req.user) // TODO: SHOULD MAKE URL AS A CONSTANCE SOMEWHERE
        .then((res) => {
          user_status = res;
        })
        .catch((error) => {
          user_status = error;
        })
    );

    if (user_status.status) {
      //Creating a link for a moodle webservice
      let firstParams = "/webservice/rest/server.php?wstoken=";
      let secondParams =
        "&wsfunction=enrol_manual_enrol_users&moodlewsrestformat=json&enrolments[0][roleid]=5&enrolments[0][userid]=" +
        user_status.user_id;
      secondParams += "&enrolments[0][courseid]=" + req.course_id;
      // Preparing result with all data taken from a moodle
      let result = getParams(firstParams, secondParams);
      //Checking for an error while enrolling to a course with error detecting algorithm. If there is no error => enrolling to a course
      if (result) {
        result = JSON.parse(result);
        response = new Object(result);
        if (response.hasOwnProperty("exception")) {
          res.send(
            JSON.stringify({
              status: "error",
              message: "Error on Enrolling user:" + response.errorcode,
            })
          );
        } else {
          if (user_status.new_user) {
            // self(new_user_email(user, product_details)); // ! FIXME: new_user_email Should be created in the PHP part of the code
            res.send(
              JSON.stringify({
                status: "success",
                message: "User Created and Enrolled",
              })
            );
          } else {
            // self(existing_user_email(user, product_details)); // ! FIXME: existing_user_email Should be created in the PHP part of the code
            res.send(
              JSON.stringify({
                status: "success",
                message: "User Enrolled",
              })
            );
          }
        }
      } else {
        res.send(
          JSON.stringify({
            status: "error",
            message: "Error on enrolling the user into the course.",
          })
        );
      }
    } else {
      res.send(
        JSON.stringify({
          status: "error",
          message: user_status.message,
        })
      );
    }
  }
});

app.patch("/unenrollfromcourse", function (req, res) {
  // PATCH/DELETE request
  let status = JSON.parse(checkintegrationsettings());
  if (status) {
    // Check if user exists
    let firstParams = "/webservice/rest/server.php?wstoken=";
    let secondParams =
      "&wsfunction=core_user_get_users&criteria[0][key]=email&criteria[0][value]=" +
      encodeURI(req.body.user_email) +
      "&moodlewsrestformat=json";
    // Preparing result with all users data taken from a moodle
    let result = getParams(firstParams, secondParams);
    //Checking for amount of the users. And if there is more than 0 user, then send the first ones id in a string
    if (result.users.length < 1) {
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
      // Creating a link for a moodle webservice
      let firstParams = "/webservice/rest/server.php?wstoken=";
      let secondParams =
        "&wsfunction=enrol_manual_unenrol_users&moodlewsrestformat=json&enrolments[0][roleid]=5&enrolments[0][userid]=" +
        checkexist.user_id;
      secondParams += "&enrolments[0][courseid]=" + req.course_id;
      // Preparing result with all data taken from a moodle
      let result = getParams(firstParams, secondParams);
      //Checking for an error while unenrolling from a course with error detecting algorithm. If there is no error => unenrolling from a course
      if (result) {
        result = JSON.parse(result);
        let response = new Object(result);
        if (response.hasOwnProperty("exception")) {
          res.send(
            JSON.stringify({
              status: "error",
              message: "Error on Unenrolling user:" + response.errorcode,
            })
          );
        } else {
          res.send(
            JSON.stringify({
              status: "success",
              message: "User Removed",
            })
          );
        }
      } else {
        res.send(
          JSON.stringify({
            status: "error",
            message: "Error on removing the user from the course.",
          })
        );
      }
    } else {
      res.send(
        JSON.stringify({
          status: "error",
          message: "Error on Unenrolling user:" + checkexist.errorcode,
        })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        status: "error",
        message: "Service disabled or not properly configured!",
      })
    );
  }
});

var server = app.listen(3030, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Example app listening at http://%s:%s", host, port);
});

const axios = require("axios");
const { response } = require("express");
const _ = require("lodash");

/** This function checks by email if user exists in moodle and send corresponding callback
 * @param  {string} req.body.email Contains email of the user that is going to be checked if exists in moodle
 * @return {JSON} return conditions of request: success or false
 */
const check_if_exists = (req, cb) => {
  let theUrl = `${process.env.MOODLE_URL}/webservice/rest/server.php?wstoken=${
    process.env.MOODLE_TOKEN
  }&wsfunction=core_user_get_users&criteria[0][key]=email&criteria[0][value]=${encodeURI(
    req.body["email"]
  )}&moodlewsrestformat=json`;
  axios
    .get(theUrl)
    .then((result) => {
      if (result.data.user.length < 1) {
        return cb({
          status: false,
          error: false,
          message: "User Does Not Exists in Moodle",
        });
      } else {
        return cb({
          status: true,
          message: "User Already Exists in Moodle",
          user_id: result.data.users[0].id,
        });
      }
    })
    .catch((error) => {
      return cb({
        status: false,
        error: true,
        message: `Error on sending a request for checking if user exists: ${error.message}`,
        data: req.body,
      });
    });
};

/** This function creates user if he is still not registered
 * @param  {string} req.body.email Contains email of the user that should be created on moodle
 * @param  {string} req.body.password Contains password of the user that should be created on moodle
 * @param  {string} req.body.name Contains first name of the user that should be created on moodle
 * @param  {string} req.body.last Contains last name of the user that should be created on moodle
 * @return {JSON} return conditions of request: success or false
 */
const create_user = (req, cb) => {
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
  let url = `${process.env.MOODLE_URL}/webservice/rest/server.php?wstoken=${
    process.env.MOODLE_TOKEN
  }"&wsfunction=core_user_create_users&users[0][username]=${encodeURI(
    req.body["email"].toLowerCase()
  )}&users[0][password]=${encodeURI(password)}&users[0][email]=${encodeURI(
    req.body["email"]
  )}&users[0][firstname]=${encodeURI(
    req.body["name"]
  )}&users[0][lastname]=${encodeURI(
    req.body["last"]
  )}&users[0][customfields][0][type]=programid&users[0][customfields][0][value]=&moodlewsrestformat=json`;
  axios
    .get(url)
    .then((response) => {
      if (response.data.hasOwnProperty("exception")) {
        return cb({
          status: false,
          message: `Error on Creating user: ${response.data.message}`,
          data: req.body,
        });
      } else {
        return cb({
          status: true,
          new_user: true,
          user_id: response.data[0].id,
          user_password: password,
          message: "User created",
        });
      }
    })
    .catch((error) => {
      return cb({
        status: false,
        message: `Error on sending a request for checking if user exists: ${error.message}`,
        data: req.body,
      });
    });
};

/** This function creates user if he is still not registered and enrolles a user to a corresponding course
 * @param  {Object} req.body.user Contains all the info about the user that should be created and/or enrolled to course
 * @param  {number} req.body.course_id Contains id of the course that should be enrolled
 * @param  {Object} req.body.product_details Contains information about product (product_sku, prod_dep, product_name, etc.) that will be used in email
 * @return {JSON} return conditions of request: success or false
 */
const enroll = (req, cb) => {
  check_if_exists(req, (exist) => {
    if (!exist.status) {
      if (exist.error) {
        return cb({
          status: false,
          message: exist.message,
          data: exist.data,
        });
      }
      create_user(req, (create) => {
        if (create.status) {
          let enrolurl = `${process.env.MOODLE_URL}/webservice/rest/server.php?wstoken=${process.env.MOODLE_TOKEN}&wsfunction=enrol_manual_enrol_users&moodlewsrestformat=json&enrolments[0][roleid]=5&enrolments[0][userid]=${create.user_id}&enrolments[0][courseid]=${req.body.course_id}`;
          axios
            .get(enrolurl)
            .then((result) => {
              if (result.data != undefined) {
                return cb({
                  status: false,
                  message: result.data.message,
                  data: req.body,
                });
              } else {
                if (response.data.new_user) {
                  return cb({
                    status: true,
                    new: create.new_user,
                    user_id: create.user_id,
                    user_password: create.user_password,
                    message: "User Created and Enrolled into course",
                  });
                }
              }
            })
            .catch((error) => {
              return cb({
                status: false,
                message: `Error on sending a request for enrolling user to a course: ${error.message}`,
                data: req.body,
              });
            });
        } else {
          return cb({
            status: false,
            message: create.message,
            data: create.data,
          });
        }
      });
    } else {
      let enrolurl = `${process.env.MOODLE_URL}/webservice/rest/server.php?wstoken=${process.env.MOODLE_TOKEN}&wsfunction=enrol_manual_enrol_users&moodlewsrestformat=json&enrolments[0][roleid]=5&enrolments[0][userid]=${exist.user_id}&enrolments[0][courseid]=${req.body.course_id}`;
      axios
        .get(enrolurl)
        .then((result) => {
          if (result.data != undefined) {
            return cb({
              status: false,
              message: result.data.message,
              data: req.body,
            });
          } else {
            if (response.data.new_user) {
              return cb({
                status: true,
                new: false,
                user_id: exist.user_id,
                message: "User Enrolled into course",
              });
            }
          }
        })
        .catch((error) => {
          return cb({
            status: false,
            message: `Error on sending a request for enrolling user to a course: ${error.message}`,
            data: req.body,
          });
        });
    }
  });
};

/** This function unenrolles a user from a corresponding course
 * @param  {string} req.body.user_email Contains email of the user that is going to be unenrolled from course
 * @param  {integer} req.body.course_id Contains id of the course that is going to unenroll user from
 * @return {JSON} return conditions of request: success or false
 */
const unenroll = (req, cb) => {
  check_if_exists(req, (exists) => {
    if (exists.status) {
      let unenroll_url = `${process.env.MOODLE_URL}/webservice/rest/server.php?wstoken=${process.env.MOODLE_TOKEN}&wsfunction=enrol_manual_unenrol_users&moodlewsrestformat=json&enrolments[0][roleid]=5&enrolments[0][userid]=${exists.user_id}&enrolments[0][courseid]=${req.body.course_id}`;
      axios
        .get(unenroll_url)
        .then((response) => {
          if (response.data != undefined) {
            return cb({
              status: false,
              message: "Error on Unenrolling user:" + response.data.message,
              data: req.body,
            });
          } else {
            return cb({
              status: true,
              message: "User Removed from Course",
            });
          }
        })
        .catch((error) => {
          return cb({
            status: false,
            message: `Error on sending a request for enrolling user to a course: ${error.message}`,
            data: req.body,
          });
        });
    } else {
      return cb(exists);
    }
  });
};

module.exports = {
  check_if_exists: check_if_exists,
  create_user: create_user,
  enroll: enroll,
  unenroll: unenroll,
};

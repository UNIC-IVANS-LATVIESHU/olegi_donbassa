var express = require("express");
var axios = require("axios");
var router = express.Router();

router.route("/createuser").post(
  (createUser = (req, res) => {
    let theUrl =
      "/webservice/rest/server.php?wstoken=" +
      process.env.MOODLE_TOKEN +
      "&wsfunction=core_user_get_users&criteria[0][key]=email&criteria[0][value]=" +
      encodeURI(req.body.user["email"]) +
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

        if (checkexist.status) {
          if (checkexist.exist) {
            res.JSON({
              status: true,
              new_user: false,
              user_id: checkexist.user_id,
              message: "User Already Exist in moodle",
            });
          } else {
            //Creating a link for a moodle webservice
            var newUrl =
              "/webservice/rest/server.php?wstoken=" + process.env.MOODLE_TOKEN;
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
              .get(process.env.MOODLE_URL + newUrl)
              .then((main_result) => {
                if (main_result.data.exception) {
                  res.send(
                    JSON.stringify({
                      status: false,
                      message: `Error on Creating user: ${main_result.errorcode}`,
                    })
                  );

                  res.JSON({
                    status: false,
                    message: `Error on Creating user: ${main_result.errorcode} ${main_result.message}`,
                    data: req.body,
                  });
                } else {
                  res.send(
                    JSON.stringify({
                      status: true,
                      new_user: true,
                      user_id: main_result.data[0].id,
                      message: "User created",
                    })
                  );
                }
              })
              .catch((error) => {
                res.JSON({
                  status: false,
                  message: error.message,
                  data: req.body,
                });
              });
          }
        } else {
          res.JSON({
            status: false,
            message: error.message,
            data: req.body,
          });
        }
      })
      .catch((error) => {
        res.JSON({
          status: false,
          message: error.message,
          data: req.body,
        });
      });
  })
);

module.exports = router;

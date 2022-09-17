const moodleRouter = require("../src/moodleRouter");
const request = require("supertest");
const express = require("express");
const app = express();

app.use("/unenrollfromcourse", moodleRouter);

test("unenrollfromcourse route works", (done) => {
  request(app)
    .post("http://localhost:3030/unenrollfromcourse", {}) // TODO: Suppose to be a special http request with sending the parameters (for success)
    .expect(
      JSON.stringify({
        status: true,
        message: "User Removed",
      })
    )
    .expect(200, done);
});

test("unenrollfromcourse route works", (done) => {
  request(app)
    .post("http://localhost:3030/unenrollfromcourse") // TODO: Suppose to be a special http request with sending the parameters (for false)
    .expect(
      JSON.stringify({
        status: false,
        message: `Error: ${error.message}`,
        data: req.body,
      })
    )
    .expect(400, error);
});

//

app.use("/enrolltocourse", moodleRouter);

test("enrolltocourse route works", (done) => {
  request(app)
    .post("http://localhost:3030/enrolltocourse") // TODO: Suppose to be a special http request with sending the parameters(for success)
    .expect(
      JSON.stringify({
        status: true,
        message: "User Created and Enrolled",
      })
    )
    .expect(200, done);
});

test("enrolltocourse route works", (done) => {
  request(app)
    .post("http://localhost:3030/enrolltocourse") // TODO: Suppose to be a special http request with sending the parameters(for false)
    .expect(
      JSON.stringify({
        status: false,
        message: `Error: ${error.message}`,
        data: req.body,
      })
    )
    .expect(400, error);
});

//

app.use("/createuser", moodleRouter);

test("createuser route works", (done) => {
  request(app)
    .post("http://localhost:3030/createuser") // TODO: Suppose to be a special http request with sending the parameters(for success)
    .expect(
      JSON.stringify({
        status: true,
        new_user: true,
        user_id: response.data[0].id,
        message: "User created",
      })
    )
    .expect(200, done);
});

test("createuser route works", (done) => {
  request(app)
    .post("http://localhost:3030/createuser") // TODO: Suppose to be a special http request with sending the parameters(for success)
    .expect(
      JSON.stringify({
        status: false,
        message: `Error on sending a request for checking if user exists: ${error.message}`,
        data: req.body,
      })
    )
    .expect(400, error);
});

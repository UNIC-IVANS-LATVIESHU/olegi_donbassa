var chai = require("chai"),
  chaiHttp = require("chai-http");
let server = require("../src/server");
const { default: axios } = require("axios");
const express = require("express");
const app = express();

chai.use(chaiHttp);
app.use(express.urlencoded({ extended: false }));

describe("Unit Test of the Moodle API", () => {
  //This Unit test sends full POST request on /enrolltocourse to get a 200 OK response with corresponding message
  it("/POST enrolltocourse - successful enroll user to a course", (done) => {
    let requestData = {
      user: {
        email: "kosiakov.i@unic.ac.cy",
        name: "Ivan",
        last: "Kosiakov",
      },
      course_id: "5",
      product_details: {
        data: "",
      },
    };
    chai
      .request(server)
      .post("/enrolltocourse")
      .send(requestData)
      .end((err, res) => {
        chai.expect(err).to.be.null;
        chai.expect(res).to.have.status(200);
        chai.expect(res.text).to.equal(
          JSON.stringify({
            status: true,
            message: "User Enrolled",
          })
        );
        done();
      });
  });

  //This Unit test sends POST request on /enrolltocourse without information about "course_id" to get a 400 Bad response with error message
  it("/POST enrolltocourse - if course undefiend", (done) => {
    let requestData = {
      user: {
        email: "kosiakov.i@unic.ac.cy",
        name: "Ivan",
        last: "Kosiakov",
      },
      course_id: "",
      product_details: {
        data: "",
      },
    };
    chai
      .request(server)
      .post("/enrolltocourse")
      .send(requestData)
      .end((err, res) => {
        resultText = res.text;
        chai.expect(err).to.be.null;
        chai.expect(res).to.have.status(400);
        done();
      });
  });

  //This Unit test sends full POST request on /createuser to get a 200 OK response with corresponding message
  // ! This Unit Test requires second web service with premission to delete users on moodle
  it("/POST createuser - successful creation of the user", (done) => {
    let requestData = {
      email: "test@unic.ac.cy",
      password: "tE5|tE5|",
      name: "Test",
      last: "Test",
    };
    chai
      .request(server)
      .post("/createuser")
      .send(requestData)
      .end((err, res) => {
        chai.expect(err).to.be.null;
        chai.expect(res).to.have.status(201);
        const answer = JSON.parse(res.text);
        if (answer.user_id) {
          const theLink =
            "/webservice/rest/server.php?wstoken=" +
            process.env.DELETE_USER_TOKEN +
            "&wsfunction=core_user_delete_users&moodlewsrestformat=json&userids[0]=" +
            answer.user_id;

          axios.delete(process.env.MOODLE_URL + theLink);
        }
        done();
      });
  });

  //This Unit test sends POST request on /createuser witho information about user that already exists in moodle to get a 200 OK response with corresponding message
  it("/POST createuser - if user already exists", (done) => {
    let requestData = {
      email: "ivan0kosyakov@gmail.com",
      password: "ivanIVAN1234@",
      name: "Ivan",
      last: "Ivan",
    };
    chai
      .request(server)
      .post("/createuser")
      .send(requestData)
      .end((err, res) => {
        chai.expect(err).to.be.null;
        chai.expect(res).to.have.status(200);
        chai.expect(res.text).to.equal(
          JSON.stringify({
            status: true,
            new_user: false,
            user_id: 20,
            message: "User Already Exist in moodle",
          })
        );
        done();
      });
  });

  //This Unit test sends POST request on /createuser with password that does not correspond minimum requirements to get a 400 Bad response with error message
  it("/POST createuser - if the password does not correspond minimum requirements", (done) => {
    let requestData = {
      email: "test@gmail.com",
      password: "@@",
      name: "Ivan",
      last: "Ivan",
    };
    chai
      .request(server)
      .post("/createuser")
      .send(requestData)
      .end((err, res) => {
        chai.expect(err).to.be.null;
        chai.expect(res).to.have.status(400);
        chai.expect(res.text).to.equal(
          JSON.stringify({
            status: false,
            message:
              "Error on Creating user: error/<div>Passwords must be at least 8 characters long.</div><div>Passwords must have at least 1 digit(s).</div><div>Passwords must have at least 1 lower case letter(s).</div><div>Passwords must have at least 1 upper case letter(s).</div>",
            data: requestData,
          })
        );
        done();
      });
  });

  //This Unit test sends POST request on /createuser with undefiend email to get a 400 Bad response with error message
  it("/POST createuser - if user email is undefiend", (done) => {
    let requestData = {
      email: "",
      password: "ivanIVAN1234@",
      name: "Ivan",
      last: "Ivan",
    };
    chai
      .request(server)
      .post("/createuser")
      .send(requestData)
      .end((err, res) => {
        chai.expect(err).to.be.null;
        chai.expect(res).to.have.status(400);
        chai.expect(res.text).to.equal(
          JSON.stringify({
            status: false,
            message: "Error on Creating user: Invalid parameter value detected",
            data: requestData,
          })
        );
        done();
      });
  });

  //This Unit test sends full POST request on /unenrollfromcourse to get a 200 OK response
  it("/POST unenrollfromcourse - successful unenroll user from a course", (done) => {
    let requestData = {
      user_email: "kosiakov.i@unic.ac.cy",
      course_id: "5",
    };
    chai
      .request(server)
      .post("/unenrollfromcourse")
      .send(requestData)
      .end((err, res) => {
        chai.expect(err).to.be.null;
        chai.expect(res).to.have.status(200);
        chai.expect(res.text).to.equal(
          JSON.stringify({
            status: true,
            message: "User Removed",
          })
        );
        done();
      });
  });

  //This Unit test sends POST request on /unenrollfromcourse with undefiend course id to get a 400 Bad response with error message
  it("/POST unenrollfromcourse - unenroll user from an undefiend course", (done) => {
    let requestData = {
      user_email: "kosiakov.i@unic.ac.cy",
      course_id: "",
    };
    chai
      .request(server)
      .post("/unenrollfromcourse")
      .send(requestData)
      .end((err, res) => {
        chai.expect(err).to.be.null;
        chai.expect(res).to.have.status(400);
        chai.expect(res.text).to.equal(
          JSON.stringify({
            status: false,
            message:
              "Error on Unenrolling user:Invalid parameter value detected",
            data: requestData,
          })
        );
        done();
      });
  });

  //This Unit test sends POST request on /unenrollfromcourse with incorrect course id to get a 400 Bad response with error message
  it("/POST unenrollfromcourse - unenroll user from not existing course", (done) => {
    let requestData = {
      user_email: "kosiakov.i@unic.ac.cy",
      course_id: "5666",
    };
    chai
      .request(server)
      .post("/unenrollfromcourse")
      .send(requestData)
      .end((err, res) => {
        chai.expect(err).to.be.null;
        chai.expect(res).to.have.status(400);
        chai.expect(res.text).to.equal(
          JSON.stringify({
            status: false,
            message:
              "Error on Unenrolling user:Can't find data record in database table course.",
            data: requestData,
          })
        );
        done();
      });
  });
});

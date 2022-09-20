var chai = require("chai"),
  chaiHttp = require("chai-http");
let server = require("../src/server");
const { default: axios } = require("axios");
const express = require("express");
const app = express();

chai.use(chaiHttp);
app.use(express.urlencoded({ extended: false }));

describe("/POST enroll to course", () => {
  it("it should enroll a user", (done) => {
    chai
      .request(server)
      .post("/enrolltocourse")
      .send({
        user: {
          email: "kosiakov.i@unic.ac.cy",
          password: "ivanIVAN1234@",
          name: "Ivan",
          last: "Kosiakov",
        },
        course_id: "5",
        product_details: {
          data: "",
        },
      })
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

  it("if course undefiend", (done) => {
    chai
      .request(server)
      .post("/enrolltocourse")
      .send({
        user: {
          email: "kosiakov.i@unic.ac.cy",
          password: "ivanIVAN1234@",
          name: "Ivan",
          last: "Kosiakov",
        },
        course_id: "",
        product_details: {
          data: "",
        },
      })
      .end((err, res) => {
        chai.expect(err).to.be.null;
        chai.expect(res).to.have.status(400);
        done();
      });
  });

  it("it should create a user", (done) => {
    chai
      .request(server)
      .post("/createuser")
      .send({
        email: "test@unic.ac.cy",
        password: "tE5|tE5|",
        name: "Test",
        last: "Test",
      })
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

  it("if user already exists", (done) => {
    chai
      .request(server)
      .post("/createuser")
      .send({
        email: "ivan0kosyakov@gmail.com",
        password: "ivanIVAN1234@",
        name: "Ivan",
        last: "Ivan",
      })
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
});

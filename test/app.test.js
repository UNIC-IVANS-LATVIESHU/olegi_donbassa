// Installed two external libraries "chai" and "mocha"
const app = require("../src/app");
const expect = require("chai").expect;

//Test of the function called "isEmpty"
describe("Testing isEmpty function", function () {
  // Checking that not-empty sting is going to return false
  it("1. Incorrect Check isEmpty", function (done) {
    let t1 = "404";
    expect(app.isEmpty(t1)).to.equal(false);
    done();
  });
  // Checking that empty string is going to return true
  it("2. Correct Check isEmpty", function (done) {
    let t1 = "";
    expect(app.isEmpty(t1)).to.equal(true);
    done();
  });
});

//Test of the function called "checkintegrationsettings"
describe("Testing checkintegrationsettings function", function () {
  // Checking that function working correctly
  it("1. Check checkintegrationsettings", function (done) {
    expect(app.checkintegrationsettings()).to.equal('{"status":"success"}');
    done();
  });
});

//Test of the function called "random_str"
describe("Testing random_str function", function () {
  // This test checks if the password with dashes is generated correctly
  it("1. Check adding of dashes functionality", function (done) {
    let t2 = 8;
    let t2_1 = true;
    let t2_2 = "luds";
    let first_result = app.random_str(t2, t2_1, t2_2);
    let dash_count = 0;
    for (let i = 0; i < t2; i++) {
      if (first_result[i] === "-") {
        dash_count++;
      }
    }
    expect(dash_count > 0).to.equal(true);
    done();
  });

  // This test checks if the password characters are generated correctly
  it("2. Check configuration of characters", function (done) {
    let t2 = 8;
    let t2_1 = false;
    let t2_2 = "us";
    let result = true;
    let first_result = app.random_str(t2, t2_1, t2_2);
    for (let i = 0; i < t2; i++) {
      if (
        (first_result[i] > "0" && first_result[i] < "9") ||
        (first_result[i] > "a" && first_result[i] < "z")
      )
        result = false;
    }
    expect(result).to.equal(true);
    done();
  });

  // This test checks if the password length is generated correctly
  it("3. Check length of characters", function (done) {
    let t2 = 8;
    let t2_1 = false;
    let t2_2 = "luds";
    let correct_length = true;
    if (app.random_str(t2, t2_1, t2_2)[t2 + 1] !== undefined) {
      correct_length = false;
    }
    expect(correct_length).to.equal(true);
    done();
  });
});

//Test of the function called "checkifuserexist"
describe("Testing checkifuserexist function", function () {
  // This test checks correctness of response if email sent to the function already exists in the moodle
  it("1. Check if exists", function (done) {
    // id of the ivan0kosyakov@gmail.com is 20
    let t3 = "ivan0kosyakov@gmail.com";
    let user_id = 20;
    expect(app.checkifuserexist(t3)).to.equal(
      JSON.stringify({
        status: "success",
        exist: true,
        user_id: user_id,
      })
    );
    done();
  });

  // This test checks correctness of response if email sent to the function does not exist yet
  it("2. Check if not exists", function (done) {
    let t3 = "someRandomString";
    expect(app.checkifuserexist(t3)).to.equal(
      JSON.stringify({
        status: "success",
        exist: false,
      })
    );
    done();
  });
});

//Test of the function called "createuser"
describe("Testing createuser function", function () {
  // This test checks correctness of response if user sent to the function already exists in the moodle
  it("1. Check if user already exists", function (done) {
    let t4 = {
      password: "ivanIVAN1234@",
      email: "kosiakov.i@unic.ac.cy",
      name: "Ivan",
      last: "Kosiakov",
    };
    expect(app.createuser(t4)).to.equal(
      JSON.stringify({
        status: "success",
        new_user: false,
        user_id: checkexist.user_id,
        message: "User Already Exist in moodle",
      })
    );
    done();
  });

  // This test checks correctness of response if user sent to the function is going to be empty
  it("2. Check Empty user", function (done) {
    let t4 = {
      password: "",
      email: "",
      name: "",
      last: "",
    };
    expect(app.createuser(t4)).to.equal(
      JSON.stringify({
        status: "error",
        message: "Error on Creating user: invalidparameter",
      })
    );
    done();
  });
});

//Test of the function called "enroltocourse"
describe("Testing enroltocourse function", function () {
  // This test checks correctness of response if course number is going to be incorrect
  it("1. Check enrol to undefiend course", function (done) {
    let t5 = {
      password: "ivanIVAN1234@",
      email: "kosiakov.i@unic.ac.cy",
      name: "Ivan",
      last: "Kosiakov",
    };
    let t5_1 = 999999;
    let t5_2 = "NULL"; // ! Until email functionality is not implemented this data is useless
    expect(app.enroltocourse(t5, t5_1, t5_2)).to.equal(
      JSON.stringify({
        status: "error",
        message: "Error on Enrolling user:invalidparameter",
      })
    );
    done();
  });

  // This test checks correctness of response if course number is going to be correct
  it("2. Check enrol to defiend course", function (done) {
    let t5 = {
      password: "ivanIVAN1234@",
      email: "kosiakov.i@unic.ac.cy",
      name: "Ivan",
      last: "Kosiakov",
    };
    let t5_1 = 5;
    let t5_2 = "NULL"; // ! Until email functionality is not implemented this data is useless
    expect(app.enroltocourse(t5, t5_1, t5_2)).to.equal(
      JSON.stringify({
        status: "success",
        message: "User Enrolled",
      })
    );
    done();
  });

  // This test checks correctness of response if user sent to the function is going to be empty
  it("3. Check Empty user", function (done) {
    let t5 = {
      password: "",
      email: "",
      name: "",
      last: "",
    };
    let t5_1 = 5;
    let t5_2 = "NULL"; // ! Until email functionality is not implemented this data is useless
    expect(app.enroltocourse(t5, t5_1, t5_2)).to.equal(
      JSON.stringify({
        status: "error",
        message: "Error on Enrolling user:invalidparameter",
      })
    );
    done();
  });
});

//Test of the function called "unenrollfromcourse"
describe("Testing unenrollfromcourse function", function () {
  // This test checks correctness of response if course number is going to be correct
  it("1. Check unenrollment from defiend course", function (done) {
    let t6 = "ivan0kosyakov@gmail.com";
    let t6_1 = 5;
    expect(app.unenrollfromcourse(t6, t6_1)).to.equal(
      JSON.stringify({
        status: "success",
        message: "User Removed",
      })
    );
    done();
  });

  // This test checks correctness of response if course number is going to be incorrect
  it("2. Check unenrollment from undefiend course", function (done) {
    let t6 = "ivan0kosyakov@gmail.com";
    let t6_1 = 999999;
    expect(app.unenrollfromcourse(t6, t6_1)).to.equal(
      JSON.stringify({
        status: "error",
        message: "Error on Unenrolling user:invalidrecord",
      })
    );
    done();
  });

  // This test checks correctness of response if email sent to the function is going to be empty
  it("3. Check Empty email", function (done) {
    let t6 = "";
    let t6_1 = 5;
    expect(app.unenrollfromcourse(t6, t6_1)).to.equal(
      JSON.stringify({
        status: "error",
        message: "Error on Unenrolling user:invalidparameter",
      })
    );
    done();
  });
});

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let issue1;
let issue2;

suite('Functional Tests', function() {
  suite("Routing Tests", function () {
    suite("POST Requests", function () {
      test("Create issue with every field", function (done) {
        chai.request(server)
          .post("/api/issues/testing")
          .send({
            issue_title: "Issue 1",
            issue_text: "Functional Test",
            created_by: "FCC",
            assigned_to: "SMM",
            status_text: "To do"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            issue1 = res.body;
            assert.equal(res.body.issue_title, "Issue 1");
            assert.equal(res.body.issue_text, "Functional Test");
            assert.equal(res.body.created_by, "FCC");
            assert.equal(res.body.assigned_to, "SMM");
            assert.equal(res.body.status_text, "To do");
            assert.equal(res.body.project, "testing");
            done();
          });
      });
  
      test("Create issue with only required fields", function (done) {
        chai.request(server)
          .post("/api/issues/testing")
          .set("content-type", "application/json")
          .send({
            issue_title: "Issue 2",
            issue_text: "Functional Test",
            created_by: "FCC",
            assigned_to: "",
            status_text: ""
          })
          .end(function (err, res){
            assert.equal(res.status, 200);
            issue2 = res.body;
            assert.equal(res.body.issue_title, "Issue 2");
            assert.equal(res.body.issue_text, "Functional Test");
            assert.equal(res.body.created_by, "FCC");
            assert.equal(res.body.assigned_to, "");
            assert.equal(res.body.status_text, "");
            assert.equal(res.body.project, "testing");
            done();
          });
      });
  
      test("Create issue with missing required fields", function (done) {
        chai.request(server)
          .post("/api/issues/testing")
          .set("content-type", "application/json")
          .send({
            issue_title: "Issue 3",
            issue_text: "",
            created_by: "",
            assigned_to: "",
            status_text: ""
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "required field(s) missing");
            done();
          });
      });
    });

    suite("GET Requests", function () {
      test("View issues on a project", function (done) {
        chai.request(server)
          .get("/api/issues/testing")
          .end(function (err, res) {
            assert.equal(res.status, 200);
            done();
          });
      });

      test("View issues on a project with one filter", function (done) {
        chai.request(server)
          .get("/api/issues/testing")
          .query({
            _id: issue1._id
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body[0].issue_title, issue1.issue_title);
            assert.equal(res.body[0].issue_text, issue1.issue_text);
            done();
          });
      });

      test("View issues on a project with multiple filters", function (done) {
        chai.request(server)
          .get("/api/issues/testing")
          .query({
            issue_title: issue1.issue_title,
            issue_text: issue1.issue_text
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body[0].issue_title, issue1.issue_title);
            assert.equal(res.body[0].issue_text, issue1.issue_text);
            done();
          });
      });
    });

    suite("PUT Requests", function () {
      test("Update a single field on an issue", function(done) {
        chai.request(server)
          .put("/api/issues/testing")
          .send({
            _id: issue1._id,
            issue_title: "Updated"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, "successfully updated");
            assert.equal(res.body._id, issue1._id);
            done();
          });
      });

      test("Update multiple fields on an issue", function (done) {
        chai.request(server)
          .put("/api/issues/testing")
          .send({
            _id: issue1._id,
            issue_title: "New Update",
            issue_text: "New Info"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, "successfully updated");
            assert.equal(res.body._id, issue1._id);
            done();
          });
      });

      test("Update an issue with missing _id", function (done) {
        chai.request(server)
          .put("/api/issues/testing")
          .send({
            issue_title: "Updated title",
            issue_text: "Update"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "missing _id");
            done();
          });
      });

      test("Update an issue with missing update fields", function (done) {
        chai.request(server)
          .put("/api/issues/testing")
          .send({
            _id: issue1._id
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "no update field(s) sent");
            done();
          });
      });

      test("Update an issue with an invalid _id", function (done) {
        chai.request(server)
          .put("/api/issues/testing")
          .send({
            _id: "abcde12345",
            issue_title: "Another New Title",
            issue_text: "Updated title"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "could not update");
            done();
          });
      });
    });

    suite("DELETE Requests", function () {
      test("Delete an issue", function (done) {
        chai.request(server)
          .delete("/api/issues/testing")
          .send({
            _id: issue1._id
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.result, "successfully deleted");
            done();
          });
      });

      test("Delete an issue with an invalid _id", function (done) {
        chai.request(server)
          .delete("/api/issues/testing")
          .send({
            _id: "12345abcde"
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "internal server error");
            done();
          });
      });

      test("Delete an issue with missing _id", function (done) {
        chai.request(server)
          .delete("/api/issues/testing")
          .send({})
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, "missing _id");
            done();
          });
      });
    });
  });
});

"use strict";
const bodyParser = require("body-parser");
const mongodb = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Connection to database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(() => {
    console.log("Couldn't connect to MongoDB");
  });

// Issue Schema
const issueSchema = new Schema({
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },  
  created_by: { type: String, required: true },
  assigned_to: String,
  open: Boolean,
  status_text: String,
  project: String,
}, {
  timestamps: { createdAt: 'created_on', updatedAt: 'updated_on' }
});

// Issue model
const Issue = mongoose.model("Issue", issueSchema);

// Project Schema
const projectSchema = new Schema({
  project: { type: String },
});

// Project Module
const Project = mongoose.model("Project", projectSchema);

module.exports = function (app) {
  app
    .route("/api/issues/:project")
    .get(async function (req, res) {
      const project = req.params.project;
      const filterObject = Object.assign(req.query);
      filterObject["project"] = project;      
      await Issue.find(filterObject)
        .then((arrayOfResults) => {          
          return res.json(arrayOfResults);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ error: "Internal server  error" });
        });
    })

    .post(async function (req, res) {
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } =
        req.body;
      // Check for required fields
      if (!issue_title || !issue_text || !created_by) {
        res.json({ error: "required field(s) missing" });
        return;
      }
      // Check if Project already exists
      if (!(await Project.exists({ project: project }))) {
        try {
          // Create new project if it doesn't exist
          let newProject = new Project({ project: project });
          await newProject.save();
        } catch (error) {
          console.error(err);
          res.status(500).json({ error: "Internal server error" });
        }
      }
      try {
        // Create a new issue
        let newIssue = new Issue({
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,               
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to || "",
          open: true,
          status_text: req.body.status_text || "",
          project: project,
        });
        // Save the new issue
        await newIssue.save();
        // Respond with the saved issue
        return res.json(newIssue);
      } catch (error) {
        res.status(500).json({ error: "Internal server error" });
      }
    })

    .put(async function (req, res) {
      const project = req.params.project;      
      let id = req.body._id;
      // Check if id is provided     
      if (!id) {
        res.json({ error: "missing _id" });
        return;
      }
      // Find which fields have been updated
      const updateObject = {};
      Object.keys(req.body).forEach(function (key) {
        if (req.body[key] != "") {
          updateObject[key] = req.body[key];
        }
      });
      
      // If no fields have been updated
      if (Object.keys(updateObject).length < 2) {
        return res.json({ error: "no update field(s) sent", _id: id });
      }      
      
      try {
        // Update issue with new information
        let doc = await Issue.findOneAndUpdate({ _id: id }, updateObject, {
          new: true,
        });
        
        // If no issue is found to update
        if (!doc) {
          return res.json({ error: "could not update", _id: id });
        }
        // Success message
        return res.json({ result: "successfully updated", _id: id });
      } catch (error) {
        return res.json({ error: "could not update", _id: id });
      }      
    })

    .delete(async function (req, res) {
      const { projectname } = req.params
      let { _id } = req.body;      
      // Check for missing id
      if (!_id) {
        return res.json({ error: "missing _id" });
      }
      try {
        // Delete issue
        const deletedIssue = await Issue.findByIdAndDelete(_id );
        // If no issue is found to delete
        if (!deletedIssue) {
          return res.json({ error: "could not delete", _id: _id });
        }
        // Success message
        return res.json({ result: "successfully deleted", _id: _id });
      } catch (error) {
        return res.json({ error: "internal server error", _id: _id });
      } 
    });
}
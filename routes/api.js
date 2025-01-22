'use strict';

const IssueModel = require("../models").Issue;
const ProjectModel = require("../models").Project;

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(async function (req, res){
      let projectName = req.params.project;
      try {
        const project = await ProjectModel.findOne({ name: projectName });
        if (!project) {
          return res.json({ error: "project not found" });
        }else {
          const issues = await IssueModel.find({ project: projectName, ...req.query });
          if (!issues) {
            return res.json([{ error: "no issues found" }]);
          }
          return res.json(issues);
        }
      }catch (err) {
        console.log(err);
        res.json({ error: "could not get", _id: _id });
      }
    })
    
    .post(async function (req, res){
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: "required field(s) missing" });
      }
      
      if(!(await ProjectModel.exists({ name: project }))) {
        try {
          let newProject = new ProjectModel({ name: project });
          await newProject.save();
        }catch (err) {
          console.error(err);
          res.status(500).json({ error: "Internal server error" });
        }
      }

      try {
        let newIssue = new IssueModel({
          issue_title: issue_title,
          issue_text: issue_text,
          created_by: created_by,
          assigned_to: assigned_to || "",
          open: true,
          status_text: status_text || "",
          project: project,
          created_on: new Date(),
          updated_on: new Date()
        });

        await newIssue.save();
        return res.json(newIssue);
      }catch (err) {
        res.status(500).json({ error: "Internal server error" });
      }
    })
    
    .put(async function (req, res){
      let projectName = req.params.project;
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;
      if (!_id) {
        return res.json({ error: "missing _id" });
      }

      if (!issue_title && !issue_text && !created_by && !assigned_to && !status_text && !open) {
        return res.json({ error: "no update field(s) sent", _id: _id });
      }

      try {
        const projectModel = await ProjectModel.findOne({ name: projectName });
        if (!projectModel) {
          throw new Error("project not found");
        }

        let issue = await IssueModel.findByIdAndUpdate(_id, {
          ...req.body,
          updated_on: new Date()
        });
        await issue.save();
        res.json({ result: "sucessfully updated", _id: _id });
      }catch (err) {
        console.log(err);
        res.json({ error: "could not update", _id: _id });
      }
    })
    
    .delete(async function (req, res){
      let projectName = req.params.project;
      const { _id } = req.body;
      if (!_id) {
        return res.json({ error: "missing _id" });
      }

      try {
        const deletedIssue = await IssueModel.findByIdAndDelete(_id);
        if (!deletedIssue) {
          return res.json({ error: "could not delete", _id: _id });
        }

        return res.json({ result: "successfully deleted", _id: _id });
      } catch (err) {
        console.log(err);
        return res.json({ error: "internal server error", _id: _id });
      }
    });
    
};

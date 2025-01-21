'use strict';

const IssueModel = require("../models").Issue;
const ProjectModel = require("../models").Project;

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      
    })
    
    .post(async function (req, res){
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      if (!issue_title || !issue_text || !created_by) {
        res.json({ error: "required field(s) missing" });
        return;
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
    
    .put(function (req, res){
      let project = req.params.project;
      
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      
    });
    
};

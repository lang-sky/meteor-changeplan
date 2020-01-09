import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router';
import { withTracker } from "meteor/react-meteor-data";
import moment from "moment";

import Tabs from '@material-ui/core/Tabs';
import Button from '@material-ui/core/Button';
import Tab from '@material-ui/core/Tab';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ViewColumnIcon from '@material-ui/icons/ViewColumn';
import ListIcon from '@material-ui/icons/List';

import config from '/imports/utils/config';

import { Activities } from '/imports/api/activities/activities';
import { Projects } from '/imports/api/projects/projects';

//Importing DHTMLX Modules
import Gantt, { handleImportData, handleDownload } from './Gantt/index.js';
import ExportDialog from './Dialog/ExportDialog';
import ImportDialog from './Dialog/ImportDialog';
import TopNavBar from '/imports/ui/components/App/App';
import AddActivity from '/imports/ui/components/Activities/Modals/AddActivity';

import { useStyles, changeManagersNames } from './utils';
import { scaleTypes, colors } from './constants';

function Timeline(props) {
  let { match, projects,  activities } = props;
  let { projectId, templateId } = match.params;

  const classes = useStyles();
  const [viewMode, setViewMode] = useState(0);
  const [zoomMode, setZoomMode] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportType, setExportType] = useState(null);
  const [edit, setEdit] = useState(false);
  const [data, setData] = useState({ data: [] });
  const [activityId, setActivityId] = useState(null);


  useEffect(() => {
    let tempData = [];
    let i, j;
    let min_date, max_date;
    

    for (i = 0; i < activities.length; i++) {
      let type = activities[i].type;
      const defaultSteps = ["Awareness", "Preparedness", "Support"];
      if (i === 0) {
        min_date = activities[0].dueDate;
        max_date = activities[0].dueDate;
      } else {
        min_date = activities[i].dueDate < min_date ? activities[i].dueDate : min_date;
        max_date = activities[i].dueDate > max_date ? activities[i].dueDate : max_date;
      }
      tempData.push({
        id: activities[i]._id,
        eventType: activities[i].label || defaultSteps[activities[i].step - 1],
        text: type[0].toUpperCase() + type.slice(1),
        start_date: moment(activities[i].dueDate).format("DD-MM-YYYY"),
        duration: 1,
        color: colors.activity[activities[i].step - 1],
        stakeholders: activities[i].stakeHolders.length,
        owner: activities[i].owner && activities[i].personResponsible
          ? `${activities[i].personResponsible.profile.firstName} ${activities[i].personResponsible.profile.lastName}`
          : null,
        completed: activities[i].completed,
        description: activities[i].description,
      });
    }
    if (activities.length > 0) {
      min_date = moment(min_date).format('DD-MM-YYYY');
      max_date = moment(max_date).format('DD-MM-YYYY');
      tempData.unshift({
        id: 888,
        eventType: 'Project Start',
        text: 'Project Start',
        start_date: min_date,
        duration: 1,
        color: 'grey',
        stakeholders: '',
        owner: '',
        completed: false,
        description: '',
      });

      tempData.push({
        id: 999,
        eventType: 'Project End',
        text: 'Project End',
        start_date: max_date,
        duration: 1,
        color: 'grey',
        stakeholders: '',
        owner: '',
        completed: false,
        description: '',
      });
    }

    if (projects[0]) {
      let owner = changeManagersNames(projects[0]);
      let impacts = projects[0] ? projects[0].impacts : [];
      for (i = 0; i < impacts.length; i++) {
        tempData.push({
          id: `impacts #${i}`,
          eventType: 'Impact',
          text: `Impact: ${impacts[i].type}`,
          start_date: moment(impacts[i].expectedDate).format("DD-MM-YYYY"),
          duration: 1,
          color: colors.impact,
          stakeholders: impacts[i].stakeholders.length,
          owner,
          description: impacts[i].description,
        })
      }

      let benefits = projects[0] ? projects[0].benefits : [];
      for (i = 0; i < benefits.length; i++) {
        tempData.push({
          id: `benefits #${i}`,
          eventType: 'Benefit',
          text: 'Stakeholder benefit',
          start_date: moment(benefits[i].dueDate).format("DD-MM-YYYY"),
          duration: 1,
          color: colors.benefit,
          stakeholders: benefits[i].stakeholders.length,
          owner,
          description: benefits[i].description,
        })
      }
    }
    if (!_.isEqual(data.data, tempData))
      setData({ data: tempData });
  }, [props]);

  return (
    <div>
      <TopNavBar menus={config.menus} {...props} />
      <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="center"
        className={classes.gridContainer}
        spacing={0}
      >
        <Grid
          container
          className={classes.topBar}
          direction="row"
          justify="space-between"
        >
          <Grid item className={classes.flexBox}>
            <Typography color="textSecondary" variant="h4" className={classes.topHeading} display="inline">
              Timeline
            </Typography>
            <Tabs
              value={viewMode}
              onChange={(e, newValue) => setViewMode(newValue)}
              indicatorColor="primary"
              textColor="primary"
              aria-label="icon tabs example"
              style={{ background: "white" }}
            >
              <Tab className={classes.activityTab} label={<div className={classes.iconTab}><ViewColumnIcon />&nbsp; Gantt</div>} />
              <Tab className={classes.activityTab} label={<div className={classes.iconTab}><ListIcon />&nbsp; List</div>} />
            </Tabs>
          </Grid>
          <Grid className={classes.flexBox}>
            <Button
              color="primary"
              onClick={() => setIsImporting(true)}
            >
              Import
            </Button>
            <Button
              color="primary"
              onClick={() => setIsExporting(true)}
              style={{ marginLeft: "20px" }}
            >
              Export
            </Button>
            <Tabs
              value={zoomMode}
              onChange={(e, newValue) => setZoomMode(newValue)}
              indicatorColor="primary"
              textColor="primary"
              style={{
                marginLeft: "20px",
                background: "white",
              }}
            >
              {scaleTypes.map((unit, idx) =>
                <Tab
                  key={`date-unit-tab-${idx}`}
                  className={classes.activityTab}
                  label={<div className={classes.iconTab}>&nbsp; {unit.toUpperCase()}</div>}
                />
              )}
            </Tabs>
          </Grid>
        </Grid>
        <Gantt
          tasks={data}
          scaleText={scaleTypes[zoomMode]}
          setActivityId={setActivityId}
          setEdit={setEdit}
          activities={activities}
        />
        <ExportDialog
          isExporting={isExporting}
          setIsExporting={setIsExporting}
          exportType={exportType}
          setExportType={setExportType}
          handleDownload={handleDownload}
        />
        <ImportDialog
          isImporting={isImporting}
          setIsImporting={setIsImporting}
          handleImportData={handleImportData}
        />
        {/* {(isAdmin && template && (template.companyId === companyId)) || isSuperAdmin ? */}
        <AddActivity
          edit={edit}
          activity={activities.find(({ _id }) => _id === activityId) || {}}
          newActivity={() => setEdit(false)}
          list={true}
          isOpen={false}
          type={templateId && 'template' || projectId && 'project'}
          match={match}
          expandAccordian1={false}
          expandAccordian2={false}
          expandAccordian3={false}
          expandAccordian4={false}
          expandAccordian5={false}
        />
      </Grid>
    </div>
  )
}

const TimelinePage = withTracker(props => {
  let { match } = props;
  let { projectId } = match.params;
  Meteor.subscribe('compoundActivities', projectId);
  // Meteor.subscribe('myProjects', null, {
  //     sort: local.sort || {},
  //     name: local.search
  // });
  return {
    activities: Activities.find().fetch(),
    projects: Projects.find(projectId).fetch(),
  };
})(withRouter(Timeline));

export default TimelinePage;
import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import CloseIcon from '@material-ui/icons/Close';

import { styles, useStyles } from '../utils';
import { INSTRUCTION_TEXT } from '../constants';
// import './ExportDialog.css';

const DialogTitle = withStyles(styles)(props => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.title} {...other}>
      <Typography variant="h2">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});
const DialogContent = withStyles(theme => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles(theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

export default function ExportDialog({
  isExporting,
  setIsExporting,
  exportType,
  setExportType,
  handleDownload,
}) {
  const classes = useStyles();
  return (
    <Dialog
      open={isExporting}
      className={classes.exportDialog}
      onClose={() => setIsExporting(false)}
      aria-labelledby="customized-dialog-title"
      maxWidth="sm"
      fullWidth={true}
    >
      <DialogTitle id="customized-dialog-title" onClose={() => setIsExporting(false)}>
        <Typography variant="h5">Export events</Typography>
      </DialogTitle>
      <DialogContent>
        <div className={classes.instructionTextExport}>
          <br />
          <Typography gutterBottom>{INSTRUCTION_TEXT['export']}</Typography>
          <br />
          <Typography gutterBottom display="inline">Export to </Typography>
          <FormControl className={classes.formControl}>
            <InputLabel id="demo-simple-select-label" className={classes.placeholder}>Select file type</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              className={classes.selectEmpty + " " + classes.selectExportType}
              displayEmpty
              value={exportType}
              onChange={({ target: { value } }) => setExportType(value)}
            >
              {
                ['MS Excel .xlsx', 'MS Project .xml', 'PDF document', 'PNG image'].map((menuTitle, idx) =>
                  <MenuItem key={`menu-${idx}`} value={idx}>{menuTitle}</MenuItem>
                )
              }
            </Select>
          </FormControl>
        </div><br />
      </DialogContent>
      <Button
        autoFocus
        className={classes.uploadButtonExport}
        onClick={() => handleDownload(exportType)}
        color="primary"
        variant="contained"
      >
        Download
      </Button>
      <br />
    </Dialog>
  );
}
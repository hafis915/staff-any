import React, { FunctionComponent, useEffect, useState } from "react";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import Button from "@material-ui/core/Button";
import CardContent from "@material-ui/core/CardContent";
import { makeStyles } from "@material-ui/core/styles";
import { getErrorMessage } from "../helper/error/index";
import { deleteShiftById, getWeeklyShift, bulkPublish } from "../helper/api/shift";
import DataTable from "react-data-table-component";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import EditIcon from "@material-ui/icons/Edit";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import { useHistory } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import Alert from "@material-ui/lab/Alert";
import { Link as RouterLink } from "react-router-dom";
import moment from "moment"

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 275,
  },
  fab: {
    position: "absolute",
    bottom: 40,
    right: 40,
    backgroundColor: 'white',
    color: theme.color.turquoise
  },
}));

interface ActionButtonProps {
  id: string;
  onDelete: () => void;
}
const ActionButton: FunctionComponent<ActionButtonProps> = ({
  id,
  onDelete,
}) => {
  return (
    <div>
      <IconButton
        size="small"
        aria-label="delete"
        component={RouterLink}
        to={`/shift/${id}/edit`}
      >
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" aria-label="delete" onClick={() => onDelete()}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </div>
  );
};

const Shifts = () => {
  const classes = useStyles();
  const history = useHistory();

  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [firstDate, setFirstDate] = useState<string | Date>("")
  const [lastDate, setLastDate] = useState<string | Date>("")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [arrayOfId, setArrayOfId] = useState<string[]>([])
  const [isPublished, setIsPublished] = useState<boolean>(false)
  const onDeleteClick = (id: string) => {
    setSelectedId(id);
    setShowDeleteConfirm(true);
  };

  const onCloseDeleteDialog = () => {
    setSelectedId(null);
    setShowDeleteConfirm(false);
  };

  const getFirstAndLastDate = async () => {
    var curr = new Date()
    var first = moment(curr).day(0).format("YYYY-MM-DD")
    var last = moment(curr).day(6).format("YYYY-MM-DD");
    var firstday = new Date(first).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
    });
    var lastday = new Date(last).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
    });
    setStartDate(first)
    setEndDate(last)
    setFirstDate(firstday)
    setLastDate(lastday)
  }

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        setErrMsg("");
        if (startDate && endDate) {
          console.log("get result")
          const { results } = await getWeeklyShift(startDate, endDate);
          results.forEach((el: any) => {
            let isIncludeinArray: boolean = arrayOfId.includes(el.id)
            if (!isIncludeinArray) {
              setArrayOfId([...arrayOfId, el.id])
            }
          })
          let checkIsPublish = results.find((el: any) => el.isPublish === true)

          if (checkIsPublish) {
            setIsPublished(true)
          } else {
            setIsPublished(false)
          }
          setRows(results);
        } else {
          await getFirstAndLastDate()

        }
      } catch (error) {
        const message = getErrorMessage(error);
        setErrMsg(message);
      } finally {

        setIsLoading(false);
      }
    };

    getData();
  }, [startDate, endDate, arrayOfId, isPublished]);

  function nextWeekHandler(event: string) {
    // var first = curr.getDate() - curr.getDay();
    // var last = first + 6;
    // var first = curr.getDate() - curr.getDay();
    let curr: string | Date
    curr = new Date(startDate)
    // let first: string
    // let last: string
    if (event === 'next') {
      curr = moment(curr).day(+7).format("YYYY-MM-DD")
    } else {
      curr = moment(curr).day(-7).format("YYYY-MM-DD")
    }
    var first = moment(curr).day(0).format("YYYY-MM-DD")
    var last = moment(curr).day(6).format("YYYY-MM-DD");
    var firstday = new Date(first).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
    });
    var lastday = new Date(last).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
    });
    setStartDate(first)
    setEndDate(last)
    setFirstDate(firstday)
    setLastDate(lastday)
  }
  const columns = [
    {
      name: "Name",
      selector: "name",
      sortable: true,
    },
    {
      name: "Date",
      selector: "date",
      sortable: true,
    },
    {
      name: "Start Time",
      selector: "startTime",
      sortable: true,
    },
    {
      name: "End Time",
      selector: "endTime",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <ActionButton id={row.id} onDelete={() => onDeleteClick(row.id)} />
      ),
    },
  ];

  const deleteDataById = async () => {
    try {
      setDeleteLoading(true);
      setErrMsg("");

      if (selectedId === null) {
        throw new Error("ID is null");
      }

      console.log(deleteDataById);

      await deleteShiftById(selectedId);

      const tempRows = [...rows];
      const idx = tempRows.findIndex((v: any) => v.id === selectedId);
      tempRows.splice(idx, 1);
      setRows(tempRows);
    } catch (error) {
      const message = getErrorMessage(error);
      setErrMsg(message);
    } finally {
      setDeleteLoading(false);
      onCloseDeleteDialog();
    }
  };
  const publishHandle = async () => {
    setIsLoading(true)
    await bulkPublish(arrayOfId, true)
    setIsLoading(false)
    setIsPublished(true)

  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card className={classes.root}>
          <CardContent>
            {errMsg.length > 0 ? (
              <Alert severity="error">{errMsg}</Alert>
            ) : (
              <></>
            )}
            <div style={{ display: "flex" }}>
              <div style={{ width: "50%", display: "flex", alignItems: "center", gap: "5px" }}>
                <ChevronLeftIcon fontSize="small" style={{ border: "1px solid black", borderRadius: "5px", cursor: "pointer" }} onClick={() => nextWeekHandler("prev")} />
                <p>{firstDate} - {lastDate}</p>
                <ChevronRightIcon fontSize="small" style={{ border: "1px solid black", borderRadius: "5px", cursor: "pointer" }} onClick={() => nextWeekHandler("next")} />

              </div>

              <div style={{ width: "50%", display: "flex", justifyContent: "flex-end", gap: "5px" }}>
                <Button variant="outlined" color="primary" onClick={() => history.push("/shift/add")}>Add Shift</Button>
                <Button variant="contained" color="primary" disabled={isPublished} onClick={publishHandle}>Publish</Button>
              </div>
            </div>
            <DataTable
              columns={columns}
              data={rows}
              pagination
              progressPending={isLoading}
            />
          </CardContent>
        </Card>
      </Grid>
      <Fab
        size="medium"
        aria-label="add"
        className={classes.fab}
        onClick={() => history.push("/shift/add")}
      >
        <AddIcon />
      </Fab>
      <ConfirmDialog
        title="Delete Confirmation"
        description={`Do you want to delete this data ?`}
        onClose={onCloseDeleteDialog}
        open={showDeleteConfirm}
        onYes={deleteDataById}
        loading={deleteLoading}
      />
    </Grid>
  );
};

export default Shifts;

import { useState, useEffect } from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import Button from "@mui/material/Button";
import TableBody from "@mui/material/TableBody";
import Typography from "@mui/material/Typography";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import Avatar from "@mui/material/Avatar";

import { DashboardContent } from "src/layouts/dashboard";

import { Iconify } from "src/components/iconify";
import { Scrollbar } from "src/components/scrollbar";

import { TableNoData } from "../table-no-data";
import { BoardTableRow } from "../board-table-row";
import { BoardTableHead } from "../board-table-head";
import { TableEmptyRows } from "../table-empty-rows";
import { BoardTableToolbar } from "../board-table-toolbar";
import { emptyRows, applyFilter, getComparator } from "../utils";

import axiosInstance from "src/services/axios";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { useTable } from "src/sections/user/view";
import type { Board } from "src/types/board";
import type { User } from "src/types/user";
import colors from "src/_mock/colors.json";

// ----------------------------------------------------------------------

const initialValues = {
  title: "",
  cover: "",
  coverColor: "",
  visibility: "private",
  owner: "",
};

export default function BoardView() {
  const table = useTable();
  const [boards, setBoards] = useState<Board[]>([]);
  const [filterTitle, setFilterTitle] = useState("");
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const dataFiltered: Board[] = applyFilter({
    inputData: boards,
    comparator: getComparator(table.order, table.orderBy),
    filterTitle,
  });

  const notFound = !dataFiltered.length && !!filterTitle;

  const handleEdit = async (id: string, board: Partial<Board>) => {
    setLoading(true);
    try {
      const response = await axiosInstance.put(`/boards/update/${id}`, board);
      setBoards((prev) =>
        prev.map((b) => (b.id === id ? response.data.board : b)),
      );
    } catch (error) {
      console.error("Failed to update board:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await axiosInstance.delete(`/boards/remove/${id}`);
      setBoards((prev) => prev.filter((board) => board.id !== id));
    } catch (error) {
      console.error("Failed to delete board:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMultiple = async () => {
    setLoading(true);
    try {
      await axiosInstance.post("/boards/remove/multiple", {
        ids: table.selected,
      });
      setBoards((prev) =>
        prev.filter((board) => !table.selected.includes(board.id)),
      );
      table.onResetPage();
      table.onSelectAllRows(false, []);
    } catch (error) {
      console.error("Failed to delete boards:", error);
    } finally {
      setLoading(false);
    }
  };

  const onClose = () => {
    setOpen(false);
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post("/boards/create", values);
      setBoards((prev) => [...prev, response.data.board]);
      setOpen(false);
      setValues(initialValues);
    } catch (error) {
      console.error("Failed to create board:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    axiosInstance
      .get("/boards")
      .then((response) => {
        setBoards(response.data);
      })
      .catch((error) => {
        console.log("Failed get boards: ", error);
      });
  }, []);

  useEffect(() => {
    if (open) {
      axiosInstance
        .get("/users")
        .then((response) => {
          setUsers(response.data);
        })
        .catch((error) => {
          console.log("Failed get users: ", error);
        });
    }
  }, [open]);

  return (
    <DashboardContent>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        id="add-board-dialog"
      >
        <DialogTitle>Thêm bảng mới</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Tên"
              value={values.title}
              name="title"
              onChange={onChange}
              fullWidth
              required
            />

            <FormControl fullWidth required>
              <FormLabel
                id="cover-label"
                sx={{
                  mb: 1,
                }}
              >
                Cover
              </FormLabel>
              <Grid container spacing={1}>
                {colors.map((color) => (
                  <Grid
                    size={{
                      xs: 3,
                    }}
                    key={color}
                  >
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{
                        backgroundColor: color,
                        height: 48,
                        border: "none",
                      }}
                      onClick={() =>
                        setValues((prev) => ({
                          ...prev,
                          coverColor: color,
                        }))
                      }
                    >
                      {values.coverColor === color && (
                        <Iconify
                          icon="eva:checkmark-fill"
                          width={20}
                          color="white"
                        />
                      )}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel id="visibility-label">Hiển thị</InputLabel>
              <Select
                labelId="visibility-label"
                name="visibility"
                value={values.visibility}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, visibility: e.target.value }))
                }
              >
                <MenuItem value="private">Riêng tư</MenuItem>
                <MenuItem value="public">Công khai</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel id="owner-label">Chủ sở hữu</InputLabel>
              <Select
                labelId="owner-label"
                name="owner"
                value={values.owner}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, owner: e.target.value }))
                }
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar
                          src={user.avatar}
                          alt={user.name}
                          sx={{ width: 24, height: 24 }}
                        />
                        <Typography variant="body2">{user.name}</Typography>
                      </Stack>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <Button variant="contained" onClick={handleSave} disabled={loading}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Box
        sx={{
          mb: 5,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Quản lý bảng
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          onClick={() => setOpen(true)}
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          Thêm bảng
        </Button>
      </Box>

      <Card>
        <BoardTableToolbar
          numSelected={table.selected.length}
          filterTitle={filterTitle}
          onFilterTitle={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterTitle(event.target.value);
            table.onResetPage();
          }}
          onDeleteMultiple={handleDeleteMultiple}
        />
        <Scrollbar>
          <TableContainer sx={{ overflow: "unset" }}>
            <Table sx={{ minWidth: 800 }}>
              <BoardTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={boards.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    boards.map((board) => board.id),
                  )
                }
                headLabel={[
                  { id: "title", label: "Tên" },
                  { id: "cover", label: "Cover" },
                  { id: "visibility", label: "Hiển thị" },
                  { id: "owner", label: "Chủ sở hữu" },
                  { id: "createdAt", label: "Ngày tạo" },
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage,
                  )
                  .map((row) => (
                    <BoardTableRow
                      key={row.id}
                      row={row}
                      selected={table.selected.includes(row.id)}
                      onSelectRow={() => table.onSelectRow(row.id)}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}

                <TableEmptyRows
                  height={68}
                  emptyRows={emptyRows(
                    table.page,
                    table.rowsPerPage,
                    boards.length,
                  )}
                />

                {notFound && <TableNoData searchQuery={filterTitle} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          labelRowsPerPage="Hàng trên trang"
          page={table.page}
          count={boards.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
    </DashboardContent>
  );
}

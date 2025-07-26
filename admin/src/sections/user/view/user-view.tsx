import { useState, useCallback, useEffect } from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import Button from "@mui/material/Button";
import TableBody from "@mui/material/TableBody";
import Typography from "@mui/material/Typography";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";

import { DashboardContent } from "src/layouts/dashboard";

import { Iconify } from "src/components/iconify";
import { Scrollbar } from "src/components/scrollbar";

import { TableNoData } from "../table-no-data";
import { UserTableRow } from "../user-table-row";
import { UserTableHead } from "../user-table-head";
import { TableEmptyRows } from "../table-empty-rows";
import { UserTableToolbar } from "../user-table-toolbar";
import { emptyRows, applyFilter, getComparator } from "../utils";

import type { User } from "src/types/user";
import axiosInstance from "src/services/axios";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";

// ----------------------------------------------------------------------

export function UserView() {
  const table = useTable();
  const [users, setUsers] = useState<User[]>([]);
  const [values, setValues] = useState({
    name: "",
    email: "",
    role: "user",
    password: "",
  });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [filterName, setFilterName] = useState("");

  const dataFiltered: User[] = applyFilter({
    inputData: users,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("/users/create", values);
      setUsers((prev) => [...prev, response.data.user]);
      setValues({
        name: "",
        email: "",
        role: "user",
        password: "",
      });
      setOpen(false);
    } catch (error) {
      console.log("Failed to save user: ", error);
    } finally {
      setLoading(false);
    }
  };

  const onClose = () => setOpen(false);

  const handleDelete = async (id: string) => {
    try {
      await axiosInstance.delete(`/users/remove/${id}`);
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (error) {
      console.log("Failed to delete user: ", error);
    }
  };

  const handleDeleteMultiple = async () => {
    try {
      await axiosInstance.post("/users/remove/multiple", {
        ids: table.selected,
      });
      setUsers((prev) =>
        prev.filter((user) => !table.selected.includes(user.id)),
      );
      table.onResetPage();
      table.onSelectAllRows(false, []);
    } catch (error) {
      console.log("Failed to delete users: ", error);
    }
  };

  const handleEdit = async (id: string, data: Partial<User>) => {
    try {
      const response = await axiosInstance.put(`/users/update/${id}`, data);

      setUsers((prev) =>
        prev.map((user) => (user.id === id ? response.data.user : user)),
      );
      setOpen(false);
    } catch (error) {
      console.log("Failed to update user: ", error);
    }
  };

  useEffect(() => {
    axiosInstance
      .get("/users")
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.log("Failed get users: ", error);
      });
  }, []);

  return (
    <DashboardContent>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        id="add-user-dialog"
      >
        <DialogTitle>Thêm người dùng mới</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Họ và tên"
              value={values.name}
              name="name"
              onChange={onChange}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              name="email"
              value={values.email}
              onChange={onChange}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel id="role-label">Vai trò</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={values.role}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, role: e.target.value }))
                }
              >
                <MenuItem value="admin">Quản trị viên</MenuItem>
                <MenuItem value="user">Người dùng</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Mật khẩu"
              type="password"
              name="password"
              onChange={onChange}
              fullWidth
              required
            />
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
          Người dùng
        </Typography>
        <Button
          variant="contained"
          color="inherit"
          onClick={() => setOpen(true)}
          startIcon={<Iconify icon="mingcute:add-line" />}
        >
          Người dùng mới
        </Button>
      </Box>

      <Card>
        <UserTableToolbar
          numSelected={table.selected.length}
          filterName={filterName}
          onFilterName={(event: React.ChangeEvent<HTMLInputElement>) => {
            setFilterName(event.target.value);
            table.onResetPage();
          }}
          onDeleteMultiple={handleDeleteMultiple}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: "unset" }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={table.order}
                orderBy={table.orderBy}
                rowCount={users.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    users.map((user) => user.id),
                  )
                }
                headLabel={[
                  { id: "name", label: "Tên" },
                  { id: "company", label: "Email" },
                  { id: "role", label: "Vai trò" },
                  { id: "status", label: "Trạng thái" },
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
                    <UserTableRow
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
                    users.length,
                  )}
                />

                {notFound && <TableNoData searchQuery={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          component="div"
          labelRowsPerPage="Hàng trên trang"
          page={table.page}
          count={users.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState("name");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === "asc";
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(id);
    },
    [order, orderBy],
  );

  const onSelectAllRows = useCallback(
    (checked: boolean, newSelecteds: string[]) => {
      if (checked) {
        setSelected(newSelecteds);
        return;
      }
      setSelected([]);
    },
    [],
  );

  const onSelectRow = useCallback(
    (inputValue: string) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected],
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage],
  );

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
  };
}

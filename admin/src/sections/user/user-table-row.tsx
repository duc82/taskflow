import { useState, useCallback } from "react";

import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Popover from "@mui/material/Popover";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import MenuList from "@mui/material/MenuList";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import MenuItem, { menuItemClasses } from "@mui/material/MenuItem";

import { Label } from "src/components/label";
import { Iconify } from "src/components/iconify";
import type { User } from "src/types/user";
import { fDateTime } from "src/utils/format-time";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  Stack,
  TextField,
} from "@mui/material";

// ----------------------------------------------------------------------

type UserTableRowProps = {
  row: User;
  selected: boolean;
  onSelectRow: () => void;
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string, values: Partial<User>) => Promise<void>;
};

interface UserTableRowValues {
  name: string;
  email: string;
  role: string;
  password?: string;
}

export function UserTableRow({
  row,
  selected,
  onSelectRow,
  onDelete,
  onEdit,
}: UserTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(
    null,
  );
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<UserTableRowValues>({
    name: row.name,
    email: row.email,
    role: row.role,
    password: "",
  });

  const onSave = async () => {
    const data = { ...values };

    if (!data.password) {
      delete data.password;
    }

    await onEdit(row.id, data);
    setOpen(false);
    setOpenPopover(null);
  };

  const onClose = () => {
    setOpen(false);
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenPopover = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setOpenPopover(event.currentTarget);
    },
    [],
  );

  const handleDelete = async () => {
    await onDelete(row.id);
    setOpenPopover(null);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        id="edit-user-dialog"
      >
        <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
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
              placeholder="Để trống nếu không thay đổi"
              onChange={onChange}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <Button onClick={onSave} color="primary">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell component="th" scope="row">
          <Box
            sx={{
              gap: 2,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Avatar alt={row.name} src={row.avatar} />
            {row.name}
          </Box>
        </TableCell>

        <TableCell>{row.email}</TableCell>

        <TableCell>
          {row.role === "admin" ? "Quản trị viên" : "Người dùng"}
        </TableCell>

        <TableCell>
          <Label color={row.deletedAt ? "error" : "success"}>
            {row.deletedAt ? "Bị xóa" : "Hoạt động"}
          </Label>
        </TableCell>

        <TableCell>{fDateTime(row.createdAt)}</TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={() => setOpenPopover(null)}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: "flex",
            flexDirection: "column",
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: "action.selected" },
            },
          }}
        >
          <MenuItem onClick={() => setOpen(true)}>
            <Iconify icon="solar:pen-bold" />
            Chỉnh sửa
          </MenuItem>

          <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Xóa
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}

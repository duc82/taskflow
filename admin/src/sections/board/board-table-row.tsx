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

import { Iconify } from "src/components/iconify";
import { fDateTime } from "src/utils/format-time";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  Grid,
  InputLabel,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import type { Board } from "src/types/board";
import colors from "src/_mock/colors.json";

// ----------------------------------------------------------------------

type BoardTableRowProps = {
  row: Board;
  selected: boolean;
  onSelectRow: () => void;
  onDelete: (id: string) => Promise<void>;
  onEdit: (id: string, values: Partial<Board>) => Promise<void>;
};

interface BoardTableRowValues {
  title: string;
  cover: string | null;
  coverColor: string | null;
  visibility: "private" | "public";
}

export function BoardTableRow({
  row,
  selected,
  onSelectRow,
  onDelete,
  onEdit,
}: BoardTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(
    null,
  );
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<BoardTableRowValues>({
    title: row.title,
    cover: row.cover,
    coverColor: row.coverColor,
    visibility: row.visibility,
  });

  const onSave = async () => {
    const data = { ...values };

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
        <DialogTitle>Chỉnh sửa bảng</DialogTitle>
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
            {row.title}
          </Box>
        </TableCell>

        <TableCell>
          {row.cover && (
            <Avatar
              src={row.cover}
              alt={row.title}
              sx={{ width: 40, height: 40 }}
            />
          )}

          {row.coverColor && (
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: row.coverColor,
              }}
            >
              {" "}
            </Avatar>
          )}
        </TableCell>

        <TableCell>
          {row.visibility === "private" ? "Riêng tư" : "Công khai"}
        </TableCell>

        <TableCell>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              src={row.owner.avatar}
              alt={row.owner.name}
              sx={{
                width: 40,
                height: 40,
              }}
            />
            <Box sx={{ ml: 1 }}>{row.owner.name}</Box>
          </Box>
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

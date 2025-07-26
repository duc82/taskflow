import { useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";

import { useRouter } from "src/routes/hooks";

import { Iconify } from "src/components/iconify";
import { CircularProgress } from "@mui/material";
import axios from "axios";
import useUser from "src/routes/hooks/use-user";

export function SignInView() {
  const router = useRouter();
  const [values, setValues] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useUser();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/sign-in`,
        values,
      );

      if (data.user.role !== "admin") {
        alert("Bạn không có quyền truy cập vào trang này.");
        return;
      }

      localStorage.setItem("token", data.accessToken);
      setUser(data.user);
      setValues({ email: "", password: "" });
      router.push("/");
    } catch (error) {
      console.log("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = (
    <Box
      component="form"
      sx={{
        display: "flex",
        alignItems: "flex-end",
        flexDirection: "column",
      }}
      onSubmit={handleSubmit}
    >
      <TextField
        fullWidth
        name="email"
        label="Địa chỉ email"
        placeholder="Nhập địa chỉ email của bạn"
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
        value={values.email}
        onChange={handleChange}
        required
      />

      <TextField
        fullWidth
        name="password"
        label="Mật khẩu"
        placeholder="Nhập mật khẩu của bạn"
        type={showPassword ? "text" : "password"}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  <Iconify
                    icon={
                      showPassword ? "solar:eye-bold" : "solar:eye-closed-bold"
                    }
                  />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        value={values.password}
        onChange={handleChange}
        sx={{ mb: 3 }}
        required
      />

      <Button
        fullWidth
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Đăng nhập"}
      </Button>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          gap: 1.5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 5,
        }}
      >
        <Typography variant="h5">Đăng nhập Admin</Typography>
      </Box>
      {renderForm}
    </>
  );
}

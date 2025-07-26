import { SvgColor } from "src/components/svg-color";

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} />
);

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData = [
  {
    title: "Bảng điều khiển",
    path: "/",
    icon: icon("ic-analytics"),
  },
  {
    title: "Người dùng",
    path: "/user",
    icon: icon("ic-user"),
  },
  {
    title: "Bảng làm việc",
    path: "/board",
    icon: icon("ic-category"),
  },
];

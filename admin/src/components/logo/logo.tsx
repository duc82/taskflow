import type { LinkProps } from '@mui/material/Link';
import { Link } from 'react-router-dom';

// ----------------------------------------------------------------------

export type LogoProps = LinkProps & {
  isSingle?: boolean;
  disabled?: boolean;
};

export function Logo({
  sx,
  disabled,
  className,
  href = '/',
  isSingle = true,
  ...other
}: LogoProps) {
  return (
    <Link to={href} className={className} style={{ textDecoration: 'none' }} {...other}>
      <img src="/assets/icons/taskflow2.png" alt="Logo" style={{ width: 30 }} />
    </Link>
  );
}

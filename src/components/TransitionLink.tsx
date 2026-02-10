import { MouseEvent } from "react";
import { Link, LinkProps, useLocation, useNavigate } from "react-router-dom";
import { navigateWithTransition } from "@/lib/viewTransition";

type TransitionLinkProps = LinkProps;

const isPlainLeftClick = (event: MouseEvent<HTMLAnchorElement>) =>
  event.button === 0 &&
  !event.defaultPrevented &&
  !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

export const TransitionLink = ({ onClick, to, ...props }: TransitionLinkProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    if (!isPlainLeftClick(event)) {
      return;
    }

    const targetPath = typeof to === "string" ? to : `${to.pathname ?? ""}${to.search ?? ""}${to.hash ?? ""}`;
    const currentPath = `${location.pathname}${location.search}${location.hash}`;

    if (!targetPath || targetPath === currentPath) {
      return;
    }

    event.preventDefault();
    navigateWithTransition(navigate, to);
  };

  return <Link {...props} to={to} onClick={handleClick} />;
};

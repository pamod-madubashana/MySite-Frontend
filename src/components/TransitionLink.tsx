import { FocusEvent, MouseEvent, PointerEvent } from "react";
import { Link, LinkProps, useLocation, useNavigate } from "react-router-dom";
import { navigateWithTransition } from "@/lib/viewTransition";
import { prefetchRoute } from "@/lib/routeLoaders";

type TransitionLinkProps = LinkProps;

const isPlainLeftClick = (event: MouseEvent<HTMLAnchorElement>) =>
  event.button === 0 &&
  !event.defaultPrevented &&
  !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

export const TransitionLink = ({
  onClick,
  to,
  onMouseEnter,
  onFocus,
  onPointerDown,
  ...props
}: TransitionLinkProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const targetPath = typeof to === "string" ? to : `${to.pathname ?? ""}${to.search ?? ""}${to.hash ?? ""}`;
  const currentPath = `${location.pathname}${location.search}${location.hash}`;

  const handlePrefetch = () => {
    if (targetPath && targetPath !== currentPath) {
      prefetchRoute(targetPath);
    }
  };

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    if (!isPlainLeftClick(event)) {
      return;
    }

    if (!targetPath || targetPath === currentPath) {
      return;
    }

    event.preventDefault();
    navigateWithTransition(navigate, to);
  };

  return (
    <Link
      {...props}
      to={to}
      onClick={handleClick}
      onMouseEnter={(event: MouseEvent<HTMLAnchorElement>) => {
        onMouseEnter?.(event);
        handlePrefetch();
      }}
      onFocus={(event: FocusEvent<HTMLAnchorElement>) => {
        onFocus?.(event);
        handlePrefetch();
      }}
      onPointerDown={(event: PointerEvent<HTMLAnchorElement>) => {
        onPointerDown?.(event);
        handlePrefetch();
      }}
    />
  );
};

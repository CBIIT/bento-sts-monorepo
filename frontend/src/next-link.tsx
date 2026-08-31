import type { AnchorHTMLAttributes, ReactNode } from "react";
import { appHref } from "./router";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children: ReactNode;
};

export default function Link({ href, children, ...props }: Props) {
  return <a href={appHref(href)} {...props}>{children}</a>;
}

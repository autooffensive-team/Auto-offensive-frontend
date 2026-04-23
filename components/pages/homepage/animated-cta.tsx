"use client";

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";

type BaseProps = {
  children: ReactNode;
  icon: ReactNode;
  className?: string;
  labelClassName?: string;
  iconClassName?: string;
  style?: CSSProperties;
};

type ButtonProps = BaseProps & {
  as?: "button";
  type?: "button" | "submit" | "reset";
};

type LinkProps = BaseProps & {
  as: "a";
  href: string;
};

const baseClasses =
  "group relative inline-flex h-[2.55em] items-center justify-start overflow-hidden rounded-xl px-[0.95em] pr-[2.2em] transition-[transform,background-color,color,box-shadow,border-color] duration-300 hover:-translate-y-px sm:h-[2.8em] sm:px-[1.2em] sm:pr-[3.3em]";

const labelClasses = "relative z-10";

const iconClasses =
  "absolute right-[0.25em] top-1/2 z-0 flex h-[1.75em] w-[1.75em] -translate-y-1/2 items-center justify-center overflow-hidden rounded-[0.55em] transition-[width,transform,background-color,color,box-shadow] duration-300 group-hover:w-[calc(100%-0.45em)] group-active:scale-95 sm:right-[0.3em] sm:h-[2.2em] sm:w-[2.2em] sm:rounded-[0.7em] sm:group-hover:w-[calc(100%-0.6em)]";

const isExternalHref = (href: string) =>
  /^(?:[a-z][a-z\d+\-.]*:|\/\/)/i.test(href);

export default function AnimatedCta(props: ButtonProps | LinkProps) {
  const {
    children,
    icon,
    className = "",
    labelClassName = "",
    iconClassName = "",
    style,
  } = props;

  const content = (
    <>
      <span className={`${labelClasses} ${labelClassName}`}>{children}</span>
      <span className={`${iconClasses} ${iconClassName}`} aria-hidden="true">
        {icon}
      </span>
    </>
  );

  const classes = `${baseClasses} ${className}`.trim();

  if (props.as === "a") {
    if (!isExternalHref(props.href)) {
      return (
        <Link href={props.href} className={classes} style={style}>
          {content}
        </Link>
      );
    }

    return (
      <a href={props.href} className={classes} style={style}>
        {content}
      </a>
    );
  }

  return (
    <button type={props.type ?? "button"} className={classes} style={style}>
      {content}
    </button>
  );
}

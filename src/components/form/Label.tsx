// * Frontend module: karyawan-web/src/components/form/Label.tsx
// & This file defines frontend UI or logic for Label.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk Label.tsx.

import { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

interface LabelProps {
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

const Label: FC<LabelProps> = ({ htmlFor, children, className }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={clsx(
        twMerge(
          "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400",
          className,
        ),
      )}
    >
      {children}
    </label>
  );
};

export default Label;

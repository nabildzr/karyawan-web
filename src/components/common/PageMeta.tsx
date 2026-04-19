// * Frontend module: karyawan-web/src/components/common/PageMeta.tsx
// & This file defines frontend UI or logic for PageMeta.tsx.
// % File ini mendefinisikan UI atau logika frontend untuk PageMeta.tsx.

import { HelmetProvider, Helmet } from "react-helmet-async";

const PageMeta = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
  </Helmet>
);

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

export default PageMeta;

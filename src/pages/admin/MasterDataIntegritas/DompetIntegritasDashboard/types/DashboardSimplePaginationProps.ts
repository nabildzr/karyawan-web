export type DashboardSimplePaginationProps = {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
};
import type { Column } from "../../../../../components/tables/DataTables/DataTableOnline";
import type { LeaderboardEntry } from "../../../../../types/integrity.types";

export const TOP_COUNT = 3;
export const TABLE_PAGE_SIZE = 10;
export const MAX_VISIBLE_PAGE_BUTTONS = 5;
export const RECENT_LOG_LIMIT = 5;

export const DASHBOARD_LEADERBOARD_TABLE_COLUMNS: Column<LeaderboardEntry>[] = [
	{
		header: "Peringkat",
		render: (entry) => `#${entry.rank}`,
		width: "w-24",
	},
	{
		header: "Karyawan",
		render: (entry) =>
			entry.position && entry.position.trim().length > 0
				? `${entry.name} (${entry.position})`
				: entry.name,
	},
	{
		header: "Poin",
		render: (entry) => entry.balance.toLocaleString("id-ID"),
		width: "w-32",
	},
	{
		header: "Level",
		accessor: "level",
		width: "w-28",
	},


];

export const DASHBOARD_LEADERBOARD_SEARCH_PLACEHOLDER =
	"Cari karyawan di leaderboard...";
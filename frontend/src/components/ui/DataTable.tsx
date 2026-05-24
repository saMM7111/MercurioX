import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    type ColumnDef,
    type PaginationState
} from '@tanstack/react-table';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pageCount?: number;
    pagination?: PaginationState;
    onPaginationChange?: (updater: any) => void;
    isLoading?: boolean;
}

const DEFAULT_PAGINATION: PaginationState = { pageIndex: 0, pageSize: 10 };

export function DataTable<TData, TValue>({
                                             columns,
                                             data,
                                             pageCount,
                                             pagination,
                                             onPaginationChange,
                                             isLoading
                                         }: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        pageCount,
        state: {
            // Always provide a pagination state so getState().pagination is never undefined
            pagination: pagination ?? DEFAULT_PAGINATION,
        },
        onPaginationChange,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
    });

    const currentPage = (pagination?.pageIndex ?? 0) + 1;
    const totalPages = table.getPageCount();
    const pageLabel = totalPages > 0 ? totalPages : '?';

    return (
        <div className="table-container">
            <table className="table">
                <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <th key={header.id}>
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                        ))}
                    </tr>
                ))}
                </thead>
                <tbody>
                {isLoading ? (
                    <tr>
                        <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem' }}>
                            Loading...
                        </td>
                    </tr>
                ) : table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem' }}>
                            No results.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>

            {onPaginationChange && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                        Page {currentPage} of {pageLabel}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage() || isLoading}
                        >
                            Previous
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage() || isLoading}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
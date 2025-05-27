"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  addToast,
  Spinner,
} from "@heroui/react";
import RenderCell from "@/components/table/RenderCell";
import TableTopBar from "@/components/table/TableTopBar";
import TableFooter from "@/components/table/TableFooter";
import { columns } from "@/constants/users";
import api from "@/utils/axiosInstance";

const INITIAL_VISIBLE_COLUMNS = ["name", "status", "actions"];

export default function Page() {
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState({
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Fetch users from the backend based on filters
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    const searchParams = new URLSearchParams({
      page: String(page),
      limit: String(rowsPerPage),
      search: filterValue,
    });

    Array.from(statusFilter).forEach((status) => {
      searchParams.append("status", status); // adds multiple: status=active&status=inactive
    });

    try {
      const res = await api.get(`/admin/users?${searchParams.toString()}`);
      const data = res.data;

      setUsers(data.users);
      setTotalUsers(data.pagination.totalUsers);
      setPage(data.pagination.page);
    } catch (error) {
      console.error("Error fetching users:", error);
      addToast({
        title: "Error",
        description: "Failed to fetch users. Please try again later.",
        color: "danger",
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filterValue, statusFilter, page, rowsPerPage]);

  const pages = Math.ceil(totalUsers / rowsPerPage) || 1;

  const headerColumns = useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const sortedItems = useMemo(() => {
    return [...users].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, users]);

  const onNextPage = useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = useMemo(
    () => (
      <TableTopBar
        filterValue={filterValue}
        onClear={onClear}
        onSearchChange={onSearchChange}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        usersLength={users.length}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    ),
    [
      filterValue,
      statusFilter,
      visibleColumns,
      users.length,
      onSearchChange,
      onRowsPerPageChange,
    ]
  );

  const bottomContent = useMemo(
    () => (
      <TableFooter
        selectedKeys={selectedKeys}
        filteredItemsLength={totalUsers}
        page={page}
        pages={pages}
        setPage={setPage}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />
    ),
    [selectedKeys, totalUsers, page, pages]
  );

  return (
    <Table
      isHeaderSticky
      aria-label="users table with custom cells, pagination and sorting"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: "max-h-[382px]",
        base: "p-6",
      }}
      selectedKeys={selectedKeys}
      selectionMode="multiple"
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSelectionChange={setSelectedKeys}
      onSortChange={setSortDescriptor}
    >
      <TableHeader columns={headerColumns}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.uid === "actions" ? "center" : "start"}
            allowsSorting={column.sortable}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        isLoading={isLoadingUsers}
        loadingContent={
          <Spinner variant="default" color="var(--color-zinc-900)" size="lg" />
        }
        emptyContent={"No users found"}
        items={sortedItems}
      >
        {(item) => (
          <TableRow key={item._id}>
            {(columnKey) => (
              <TableCell>
                <RenderCell
                  user={item}
                  columnKey={columnKey}
                  setUsers={setUsers}
                />
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

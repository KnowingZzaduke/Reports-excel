import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  getKeyValue,
} from "@nextui-org/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { request } from "../data/request";
export default function DataTable() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const pages = Math.ceil(data?.length / rowsPerPage);
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return data ? data.slice(start, end) : [];
  }, [page, data]);

  const loadData = useCallback(async () => {
    try {
      const response = await request.loaddata();
      if (response) {
        setData(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-3">
    <h1 className="py-3">Tabla de registros</h1>
      <Table
        aria-label="Example table with client side pagination"
        bottomContent={
          pages > 0 ? (
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="primary"
                page={page}
                total={pages}
                onChange={(page) => setPage(page)}
              />
            </div>
          ) : null
        }
        classNames={{
          wrapper: "min-h-[222px]",
        }}
      >
        <TableHeader>
          <TableColumn key="cliente">NOMBRE CLIENTE</TableColumn>
          <TableColumn key="fecha_hora-actual">FECHA Y HORA DE LA LLAMADA</TableColumn>
          <TableColumn key="numero">NÚMERO</TableColumn>
          <TableColumn key="saldo">SALDO PENDIENTE</TableColumn>
          <TableColumn key="dias_vencidos">DIAS VENCIMIENTO</TableColumn>
          <TableColumn key="fecha">FECHA</TableColumn>
          <TableColumn key="comentario">COMENTARIO</TableColumn>
        </TableHeader>
        <TableBody items={items}>
          {(item) => (
            <TableRow key={item.numero} style={{ color: "black" }}>
              {(columnKey) => (
                <TableCell>{getKeyValue(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
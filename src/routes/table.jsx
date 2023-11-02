import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  getKeyValue,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import videoWater from "/onda.mp4";
import imgWater from "/dysam.jpg";
import { useCallback, useEffect, useMemo, useState } from "react";
import { request } from "../data/request";
export default function DataTable() {
  const [data, setData] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showModalNotResults, setShowModalNotResults] = useState(false);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const pages = Math.ceil(data?.length / rowsPerPage);
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return data ? data.slice(start, end) : [];
  }, [page, data]);

  useEffect(() => {
    loadData();
  }, []);

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
    if (data === "No se encontraron registros en la tabla datos_formularios" || data === null) {
      setShowModalNotResults(true);
      onOpen();
    } else {
      setShowModalNotResults(false);
    }
  }, [data]);


  useEffect(() => {
    const video = document.createElement("video");
    video.src = videoWater;
    video.onloadeddata = () => {
      setVideoLoaded(true);
    };
  }, []);

  return (
    <div
      className="flex flex-col justify-center relative"
      style={{ minHeight: "100vh", overflow: "hidden" }}
    >
      {videoLoaded === true ? (
        <video
          src={videoWater}
          autoPlay
          muted
          loop
          playsInline
          className="absolute t-0 l-0 w-100"
          style={{
            objectFit: "cover",
            zIndex: "-1",
            height: "100%",
            width: "100%",
          }}
        />
      ) : (
        <img
          src={imgWater}
          alt="fondo de agua"
          className="absolute t-0 l-0 w-full h-full"
          style={{ objectFit: "cover", zIndex: "-1" }}
        />
      )}
      <div className="p-3">
        {showModalNotResults === false ? (
          <>
            <h1 className="py-3 font-semibold" style={{ fontSize: "30px" }}>
              Tabla de registros
            </h1>
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
                <TableColumn key="fecha_hora-actual">
                  FECHA Y HORA DE LA LLAMADA
                </TableColumn>
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
          </>
        ) : (
          <></>
        )}
      </div>
      {showModalNotResults && (
        <Modal backdrop="blur" isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            <>
              <ModalHeader className="flex flex-col gap-1 text-black">
                Alerta!
              </ModalHeader>
              <ModalBody>
                <p className="text-black">
                  No se han guardado datos en la tabla!
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="success" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}

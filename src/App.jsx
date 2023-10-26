import { useState, useEffect } from "react";
import {
  Input,
  Select,
  SelectItem,
  Textarea,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import "../dist/output.css";
import "./index.css";
import videoWater from "/onda.mp4";
import imgWater from "/dysam.jpg";
import { request } from "./data/request";
import * as XLSX from "xlsx";
function App() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showClient, setShowClient] = useState(false);
  const [data, setData] = useState(null);
  const [selectedValue, setSelectedValue] = useState(new Set([]));
  const [showForm, setShowForm] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [infoModal, setInfoModal] = useState(null);
  const [nowDate, setNowDate] = useState("");
  const [params, setParams] = useState({
    nombreCliente: "",
    tiempoActual: null,
    numero: null,
    fecha: "",
    saldoPendiente: null,
    fechaVencida: null,
    comentario: "",
  });
  const [sendParams, setSendParams] = useState({
    nombreCliente: params.nombreCliente,
    tiempoActual: null,
    numero: null,
    fecha: "",
    saldoPendiente: null,
    fechaVencida: null,
    comentario: "",
  });
  useEffect(() => {
    const video = document.createElement("video");
    video.src = videoWater;
    video.onloadeddata = () => {
      setVideoLoaded(true);
    };
  }, []);

  function selectedFile(e) {
    const file = e.target.files[0];
    if (file) {
      var reader = new FileReader();
      reader.onload = function (e) {
        let data = new Uint8Array(e.target.result);
        let workbook = XLSX.read(data, { type: "array" });
        let sheet = workbook.Sheets[workbook.SheetNames[0]];
        let jsonData = XLSX.utils.sheet_to_json(sheet);

        if (jsonData) {
          const uniqueClientData = {}; // Objeto para almacenar los datos únicos de clientes

          jsonData.forEach((record) => {
            const nombreCliente = record.NombreCliente;
            if (!uniqueClientData[nombreCliente]) {
              uniqueClientData[nombreCliente] = {
                NombreCliente: new Set(),
                Numero: new Set(),
                Fechas: new Set(), // Usamos un Set para mantener fechas únicas por cliente
                SaldoPendiente: new Set(),
                DiasVencimiento: new Set(),
                Llamar: record.Llamar,
              };
            }

            if (record.Llamar === "Por llamar") {
              uniqueClientData[nombreCliente].NombreCliente.add(nombreCliente);
              uniqueClientData[nombreCliente].Numero.add(record.Numero);
              uniqueClientData[nombreCliente].Fechas.add(record.Fecha); // Agregar la fecha al conjunto para mantenerla única
              uniqueClientData[nombreCliente].SaldoPendiente.add(
                record.SaldoPendiente
              );
              uniqueClientData[nombreCliente].DiasVencimiento.add(
                record.DiasVencimiento
              );
              // Convierte el objeto de datos únicos en un array para establecerlo en `setData`
              const uniqueData = Object.values(uniqueClientData);
              if (uniqueData) {
                const finallyData = uniqueData.map((item) => {
                  const nombreCliente = Array.from(item.NombreCliente);
                  const fechasCliente = Array.from(item.Fechas);
                  const numeroCliente = Array.from(item.Numero);
                  const saldoPendiente = Array.from(item.SaldoPendiente);
                  const diasVencidos = Array.from(item.DiasVencimiento);
                  return {
                    ...item,
                    NombreCliente: nombreCliente,
                    Numero: numeroCliente,
                    Fechas: fechasCliente,
                    SaldoPendiente: saldoPendiente,
                    DiasVencimiento: diasVencidos,
                  };
                });
                if (finallyData) {
                  setData(finallyData);
                }
              }
            }
          });
        }
      };
      setShowClient(true);
      reader.readAsArrayBuffer(file);
    }
  }
  useEffect(() => {
    if (data && selectedValue) {
      setSendParams((prevData) => ({
        ...prevData,
        nombreCliente: selectedValue,
      }));
      const filterData = data.filter((item) => {
        return item.NombreCliente.some((nombre) => selectedValue.has(nombre));
      });
      if (filterData.length > 0) {
        filterData.map((item) => {
          setParams((prevParams) => ({
            ...prevParams,
            nombreCliente: item.NombreCliente,
            tiempoActual: nowDate,
            numero: item.Numero,
            fecha: item.Fechas,
            saldoPendiente: item.SaldoPendiente,
            fechaVencida: item.DiasVencimiento,
          }));
        });
      }
      getNowDate();
    }
  }, [selectedValue]);

  useEffect(() => {
    console.log(sendParams);
  }, [sendParams]);

  function getNowDate() {
    let fechaActualUTC = new Date();
    fechaActualUTC.setHours(fechaActualUTC.getHours() - 5);
    let formattedFechaActual = fechaActualUTC
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    setSendParams((prevData) => ({
      ...prevData,
      tiempoActual: formattedFechaActual,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (sendParams.comentario !== "") {
      try {
        const response = await request.savedata(sendParams);
        if (response) {
          setInfoModal(response.data);
          onOpen();
        }
      } catch (error) {
        alert(error);
      }
    }
  }

  return (
    <div
      className="relative flex justify-center align-middle"
      style={{ minHeight: "100vh", overflow: "hidden" }}
    >
      {videoLoaded === true ? (
        <video
          src={videoWater}
          autoPlay
          muted
          loop
          playsInline
          className="absolute t-0 l-0 w-100 h-100"
          style={{ objectFit: "cover", zIndex: "-1" }}
        />
      ) : (
        <img
          src={imgWater}
          alt="fondo de agua"
          className="absolute t-0 l-0 w-full h-full"
          style={{ objectFit: "cover", zIndex: "-1" }}
        />
      )}
      <div className="flex flex-col justify-center border-solid py-3">
        <div className="border-2 rounded-medium border-black bg-white">
          <div
            className="flex flex-col p-4 rounded"
            style={{ backgroundColor: "#CACFD2", margin: "10px" }}
          >
            <label className="text-black py-2 px-4" htmlFor="input-file">
              Selecciona un archivo excel
            </label>
            <div className="rounded-medium border border-solid bg-white">
              <input
                type="file"
                className="p-4 text-black"
                id="input-file"
                onChange={(e) => selectedFile(e)}
                accept=".xlsx"
              />
            </div>
          </div>
          <div
            className={showClient === true ? "showClient" : "notShowClient"}
            style={{ backgroundColor: "#CACFD2", margin: "10px" }}
          >
            <Select
              isRequired
              color="primary"
              label="Cliente"
              placeholder="Seleccionar un cliente"
              className="w-full py-2"
              selectedKeys={selectedValue}
              onSelectionChange={setSelectedValue}
            >
              {data &&
                data.map((item, index) =>
                  item.NombreCliente.map((nombre, index) => (
                    <SelectItem
                      key={nombre}
                      value={nombre}
                      className="text-black"
                      onClick={() => setShowForm(true)}
                    >
                      {nombre}
                    </SelectItem>
                  ))
                )}
            </Select>
          </div>
          <div
            className={showForm === true ? "showForm" : "notShowForm"}
            style={{ backgroundColor: "#CACFD2", margin: "10px" }}
          >
            <form onSubmit={handleSubmit}>
              <div>
                <Input
                  type="text"
                  label="Fecha y hora"
                  color="primary"
                  className="w-full py-3"
                  value={sendParams.tiempoActual}
                  onChange={(newSelection) =>
                    setSendParams({ ...sendParams, fecha: newSelection })
                  }
                />
              </div>
              <div>
                <Select
                  isRequired
                  color="primary"
                  label="Numero"
                  placeholder="Seleccionar numero"
                  className="w-full py-2"
                  selectedKeys={sendParams.numero}
                  onSelectionChange={(newSelection) =>
                    setSendParams({ ...sendParams, numero: newSelection })
                  }
                >
                  {params.numero &&
                    params.numero.map((numero, index) => (
                      <SelectItem
                        key={numero}
                        value={numero}
                        className="text-black"
                      >
                        {numero}
                      </SelectItem>
                    ))}
                </Select>
              </div>
              <div>
                <Select
                  isRequired
                  color="primary"
                  label="Fechas"
                  placeholder="Seleccionar fecha"
                  className="w-full py-2"
                  selectedValue={sendParams.fecha}
                  onSelectionChange={(newSelection) =>
                    setSendParams({ ...sendParams, fecha: newSelection })
                  }
                >
                  {params.fecha &&
                    params.fecha.map((fecha, index) => (
                      <SelectItem
                        key={fecha}
                        value={fecha}
                        className="text-black"
                      >
                        {fecha}
                      </SelectItem>
                    ))}
                </Select>
              </div>
              <div>
                <Select
                  isRequired
                  color="primary"
                  label="Saldo/s pendiente/s"
                  placeholder="Seleccionar saldo pendiente"
                  className="w-full py-2"
                  selectedValue={sendParams.saldoPendiente}
                  onSelectionChange={(newSelection) =>
                    setSendParams({ ...sendParams, saldoPendiente: newSelection })
                  }
                >
                  {params.saldoPendiente &&
                    params.saldoPendiente.map((saldo, index) => (
                      <SelectItem
                        key={saldo}
                        value={saldo}
                        className="text-black"
                      >
                        {saldo}
                      </SelectItem>
                    ))}
                </Select>
              </div>
              <div>
                <Select
                  isRequired
                  color="primary"
                  label="Dias Vencimiento"
                  placeholder="Dias Vencimiento"
                  className="w-full py-2"
                  selectedValue={sendParams.fechaVencida}
                  onSelectionChange={(newSelection) =>
                    setSendParams({ ...sendParams, fechaVencida: newSelection })
                  }
                >
                  {params.fechaVencida &&
                    params.fechaVencida.map((dias, index) => (
                      <SelectItem
                        key={dias}
                        value={dias}
                        className="text-black"
                      >
                        {dias}
                      </SelectItem>
                    ))}
                </Select>
              </div>
              <Textarea
                label="Comentario"
                color="primary"
                labelPlacement="outside"
                placeholder="Ingresa el comentario"
                className="w-full py-3 text-black"
                value={sendParams.comentario}
                onChange={(e) =>
                  setSendParams((prevParams) => ({
                    ...prevParams,
                    comentario: e.target.value,
                  }))
                }
              />
              <div className="p-4">
                <Button
                  type="submit"
                  radius="full"
                  color="success"
                  className="w-full"
                >
                  Enviar
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {infoModal && (
        <Modal backdrop="blur" isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1 text-black">
                  {infoModal?.salida}
                </ModalHeader>
                <ModalBody>
                  <p className="text-black">{infoModal?.mensaje}</p>
                </ModalBody>
                <ModalFooter>
                  <Button color="success" variant="light" onPress={onClose}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}

export default App;

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
  const [showNumber, setShowNumber] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState(new Set([]));
  const [showErrorFactNumber, setShowErrorFactNumer] = useState(false);
  const [showErrorNotNumber, setShowErrorNotNumber] = useState(false);
  const [showNotResultsNumber, setShowNotResultsNumber] = useState(false);
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
          setData(jsonData);
        }
      };
      setShowClient(true);
      reader.readAsArrayBuffer(file);
    }
  }

  useEffect(() => {
    getNowDate();
  }, []);

  function handleSubmitFactNumber() {
    setShowNotResultsNumber(false);
    setShowErrorNotNumber(false);
    if (sendParams.numero !== "" && sendParams.numero !== null) {
      if (data !== null) {
        const filterData = data.filter(
          (item) => item.Numero === sendParams.numero
        );
        if (filterData.length !== 0) {
          console.log(filterData);
          filterData.forEach((item) => {
            setSendParams(() => ({
              ...sendParams,
              nombreCliente: item.NombreCliente,
              numero: item.Numero,
              fecha: item.Fecha,
              saldoPendiente: item.SaldoPendiente,
              fechaVencida: item.DiasVencimiento,
              comentario: sendParams.comentario,
            }));
          });
          setShowForm(true);
        } else {
          setShowNotResultsNumber(true);
        }
      }
    } else {
      setShowErrorNotNumber(true);
      console.log("modal");
    }
  }

  useEffect(() => {
    console.log(sendParams);
  }, [sendParams]);

  useEffect(() => {
    if (showNotResultsNumber === true) {
      onOpen();
      setTimeout(() => {
        onClose();
        setShowNotResultsNumber(false);
      }, 2000);
    }
  }, [showNotResultsNumber]);

  useEffect(() => {
    if (showErrorNotNumber === true) {
      onOpen();
      setTimeout(() => {
        onClose();
        setShowErrorNotNumber(false);
      }, 2000);
    }
  }, [showErrorNotNumber]);

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
    for (let i = 0; i < sendParams.length; i++) {
      if (sendParams.length[i] === null) {
        console.log("Uno de los datos ingresados en nulo");
      } else {
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
          className="absolute t-0 l-0 w-100"
          style={{ objectFit: "cover", zIndex: "-1", height: "100%" }}
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
            <div>
              <Input
                type="number"
                label="Ingresa el número de la factura"
                color="primary"
                isRequired
                className="w-full py-3"
                value={sendParams.numero}
                onChange={(e) =>
                  setSendParams({ ...sendParams, numero: e.target.value })
                }
              />
            </div>
            <div className="p-4">
              <Button
                color="warning"
                className="w-full"
                radius="full"
                type="button"
                onClick={handleSubmitFactNumber}
              >
                Buscar número de factura
              </Button>
            </div>
          </div>

          <div
            className={showForm === true ? "showForm" : "notShowForm"}
            style={{ backgroundColor: "#CACFD2", margin: "10px" }}
          >
            <form onSubmit={handleSubmit}>
              <div>
                <Input
                  type="text"
                  label="Nombre del cliente"
                  color="primary"
                  className="w-full py-3"
                  value={sendParams.nombreCliente}
                  onChange={() => setSendParams(sendParams.nombreCliente)}
                />
              </div>
              <div>
                <Input
                  type="text"
                  label="Fecha y hora"
                  color="primary"
                  className="w-full py-3"
                  value={sendParams.tiempoActual}
                  onChange={() => setSendParams(sendParams.tiempoActual)}
                />
              </div>
              <div>
                <Input
                  type="text"
                  label="Fecha"
                  color="primary"
                  className="w-full py-3"
                  value={sendParams.fecha}
                  onChange={() => setSendParams(sendParams.fecha)}
                />
              </div>
              <div>
                <Input
                  type="text"
                  label="Saldo pendiente"
                  color="primary"
                  className="w-full py-3"
                  value={sendParams.saldoPendiente}
                  onChange={() => setSendParams(sendParams.saldoPendiente)}
                />
              </div>
              <div>
                <Input
                  type="text"
                  label="Días de vencimiento"
                  color="primary"
                  className="w-full py-3"
                  value={sendParams.fechaVencida}
                  onChange={() => setSendParams(sendParams.fechaVencida)}
                />
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

      {showErrorNotNumber && (
        <Modal backdrop="blur" isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            <>
              <ModalHeader className="flex flex-col gap-1 text-black">
                Error!
              </ModalHeader>
              <ModalBody>
                <p className="text-black py-3">
                  Por favor ingresa un número de factura válido
                </p>
              </ModalBody>
            </>
          </ModalContent>
        </Modal>
      )}
      {showNotResultsNumber && (
        <Modal backdrop="blur" isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            <>
              <ModalHeader className="flex flex-col gap-1 text-black">
                Error!
              </ModalHeader>
              <ModalBody>
                <p className="text-black py-2">
                  El número de factura ingresado no fue encontrado
                </p>
              </ModalBody>
            </>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}

export default App;

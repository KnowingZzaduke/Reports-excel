import axios from "axios";
export const request = {
  savedata: async function (data) {
    const formData = new FormData();
    formData.append("cliente", data.nombreCliente);
    formData.append("tiempoActual", data.tiempoActual);
    formData.append("numero", data.numero);
    formData.append("fecha", data.fecha);
    formData.append("saldo", data.saldoPendiente);
    formData.append("diasVencidos", data.fechaVencida);
    formData.append("comentario", data.comentario);
    try {
      const response = await axios.post(
        "http://127.0.0.1/reportesExcel/backend/api.php?action=savedata",
        formData
      );
      return response;
    } catch (error) {
      console.log(error);
    }
  },
  loaddata: async function () {
    try {
      const response = await axios.get(
        "http://127.0.0.1/reportesExcel/backend/api.php?action=loaddata"
      );
      return response;
    } catch (error) {
      console.error(error);
    }
  },
};

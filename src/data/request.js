import axios from "axios";
export const request = {
  savedata: async function (data) {
    const formData = new FormData();
    formData.append(
      "cliente",
      data.nombreCliente.values().next().value.toString()
    );
    formData.append("tiempoActual", data.tiempoActual);
    formData.append("numero", data.numero.values().next().value.toString());
    formData.append("fecha", data.fecha.values().next().value.toString());
    formData.append(
      "saldo",
      data.saldoPendiente.values().next().value.toString()
    );
    formData.append(
      "diasVencidos",
      data.fechaVencida.values().next().value.toString()
    );
    formData.append("comentario", data.comentario);
    try {
      const response = await axios.post(
        "http://127.0.0.1/backend/api.php?action=savedata",
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
        "http://127.0.0.1/backend/api.php?action=loaddata"
      );
      return response;
    } catch (error) {
      console.error(error);
    }
  },
  searchfactnumber: async function (number) {
    console.log(number)
    const formData = new FormData();
    formData.append("numero", number);
    try {
      const response = await axios.post(
        "http://127.0.0.1/backend/api.php?action=loadfactdata",
        formData
      );
      console.log(response);
      return response
    } catch (error) {
      console.log(error);
    }
  },
};

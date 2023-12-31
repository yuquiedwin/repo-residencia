import "bootstrap/dist/css/bootstrap.min.css";
import "https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js";
import useAuth from "../../hooks/useAuth";
import { Navigate } from "react-router-dom";
import Header from "../../components/header";
import { useFormik } from "formik";
import * as Yup from "yup";
import { React, useCallback, useState, useEffect } from "react";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Campo requerido"),
});
export const Periods = () => {
  //Obtiene la info de autenticacion
  const { auth } = useAuth();
  const [saved, setSaved] = useState("not saved");
  const token = localStorage.getItem("token");
  const [data, setData] = useState([]);
  const [loadingPeriods, setLoadingPeriods] = useState(true);

  const getPeriods = useCallback(async () => {
    if (auth && auth.role === "Admin") {
      try {
        const response = await fetch(
          "http://localhost:3000/api/period/getAllPeriods",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: token,
            },
          }
        );

        //Obtiene la respuesta de la petición y la convierte a json
        const data = await response.json();
        console.log(data);
        //Si la respuesta es correcta, se guardan los datos en el estado setData
        if (data.status === "success") {
          setData(data.periods);
          setLoadingPeriods(false);
        } else {
          setLoadingPeriods(false);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  }, [auth, token]);

  //Funcion para cargar los periodos en el select justo al cargar la página
  useEffect(() => {
    const fetchPeriods = async () => {
      await getPeriods();
    };

    fetchPeriods();
  }, [getPeriods]);

  const formik = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/period/registerPeriod",
          {
            method: "POST",
            body: JSON.stringify(values),
            headers: {
              "Content-Type": "application/json",
              Authorization: localStorage.getItem("token"),
            },
          }
        );

        const data = await response.json();

        if (data.status === "success") {
          setSaved("saved");
        } else {
          setSaved("not saved");
          if (data.status === "error" && data.message === "Missing data") {
            setSaved("missing data");
          }
          if (data.status === "error" && data.message === "Validation failed") {
            setSaved("validation failed");
          }
          if (
            data.status === "error" &&
            data.message === "Period already exists"
          ) {
            setSaved("period already exists");
          }
          if (
            data.status === "error" &&
            data.message === "Error in the request"
          ) {
            setSaved("error in the request");
          }
          if (
            data.status === "error" &&
            data.message === "Error saving period"
          ) {
            setSaved("error saving period");
          }
        }
      } catch (error) {
        console.error("Error:", error);
      }
    },
  });

  return (
    <>
      {auth._id ? (
        <>
          <Header title={"Periodos"} />
          <h5>
            <p>
              En este apartado podrás crear los periodos que se usarán para
              crear los programas presupuestarios, esto para agilizar el proceso
              de registro de los programas presupuestarios.
            </p>
          </h5>
          <label htmlFor="name" className="form-label">
            Nombre de periodo
          </label>
          <br />
          {saved === "saved" ? <strong>Guardado con éxito</strong> : ""}
          {saved === "period already exists" ? (
            <strong>El periodo ya existe</strong>
          ) : (
            ""
          )}
          {saved === "missing data" ? <strong>Faltan datos</strong> : ""}
          {saved === "validation failed" ? (
            <strong>Datos inválidos</strong>
          ) : (
            ""
          )}
          {saved === "error in the request" ? (
            <strong>Ha ocurrido un error en el servidor</strong>
          ) : (
            ""
          )}
          {saved === "error saving period" ? (
            <strong>Ha ocurrido un error al guardar el periodo</strong>
          ) : (
            ""
          )}
          <form onSubmit={formik.handleSubmit}>
            <input
              type="text"
              className="form-control"
              placeholder="Nombre de periodo"
              id="name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
            />
            {formik.errors.name && formik.touched.name ? (
              <div className="error">{formik.errors.name}</div>
            ) : (
              ""
            )}
            <br />
            <button type="submit" className="btn btn-info">
              Guardar
            </button>
          </form>
        </>
      ) : (
        <Navigate to="/login" />
      )}
    </>
  );
};

export default Periods;

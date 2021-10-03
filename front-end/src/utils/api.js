/**
 * Defines the base URL for the API.
 * The default values is overridden by the `API_BASE_URL` environment variable.
 */
import formatReservationDate from "./format-reservation-date";
import formatReservationTime from "./format-reservation-time";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

/**
 * Defines the default headers for these functions to work with `json-server`
 */
const headers = new Headers();
headers.append("Content-Type", "application/json");

/**
 * Fetch `json` from the specified URL and handle error status codes and ignore `AbortError`s
 *
 * This function is NOT exported because it is not needed outside of this file.
 *
 * @param url
 *  the url for the request.
 * @param options
 *  any options for fetch
 * @param onCancel
 *  value to return if fetch call is aborted. Default value is undefined.
 * @returns {Promise<Error|any>}
 *  a promise that resolves to the `json` data or an error.
 *  If the response is not in the 200 - 399 range the promise is rejected.
 */
async function fetchJson(url, options, onCancel) {
  try {
    const response = await fetch(url, options);

    if (response.status === 204) {
      return null;
    }

    const payload = await response.json();

    if (payload.error) {
      return Promise.reject({ message: payload.error });
    }
    return payload.data;
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error.stack);
      throw error;
    }
    return Promise.resolve(onCancel);
  }
}

/**
 * Retrieves all existing reservation.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of reservation saved in the database.
 */

export async function listReservations(params, signal) {
  /** url for reservations to be listed on */
  const url = new URL(`${API_BASE_URL}/reservations`);
  /** checks for params, which would mean that there are reservation(s) to be listed */
  if (params) {
    /** goes through each reservation and converts it into readable JSON as a string */
    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.append(key, value.toString())
    );
  }
  /** params: url to retrieve, fetch options, [] to only fetch once */
  return await fetchJson(url, { headers, signal, method: "GET" }, [])
    /** uses functions from utils to format the date and time of each
     * reservation before displaying them on the page */
    .then(formatReservationDate)
    .then(formatReservationTime);
}


/** posts a new reservation to the reservations page */
export async function createReservation(reservation, signal) {
  const url = `${API_BASE_URL}/reservations`;
  /** convert reservation body into a string */
  const body = JSON.stringify({ data: reservation });
  return await fetchJson(url, { headers, signal, method: "POST", body }, []);
}

/** returns all tables on the tables page */
export async function listTables(signal) {
  const url = `${API_BASE_URL}/tables`;
  /** goes through each table and uses append() to add it to the table row to display */
  return await fetchJson(url, { headers, signal, method: "GET" }, []);
}

/** posts a new table to the tables page */
export async function createTable(table, signal) {
  const url = `${API_BASE_URL}/tables`;
  const body = JSON.stringify({ data: table });
  return await fetchJson(url, { headers, signal, method: "POST", body }, []);
}

/** returns a updated data to a given reservation's page */
export async function editReservation(reservation_id, reservation, signal) {
  const url = `${API_BASE_URL}/reservations/${reservation_id}`;
  const body = JSON.stringify({ data: reservation });
  return await fetchJson(url, { headers, signal, method: "PUT", body }, []);
}

/** returns a updated data about the reservation's status to the given reservation's page */
export async function updateReservationStatus(reservation_id, status, signal) {
  const url = `${API_BASE_URL}/reservations/${reservation_id}/status`;
  const body = JSON.stringify({ data: { status: status } }); //> ?
  return await fetchJson(url, { headers, signal, method: "PUT", body }, []);
}

/** returns an updated "occupied" status for a given table */
export async function seatReservation(reservation_id, table_id, signal) {
  const url = `${API_BASE_URL}/tables/${table_id}/seat`;
  const body = JSON.stringify({ data: { reservation_id: reservation_id } });
  return await fetchJson(url, { headers, signal, method: "PUT", body }, []);
}

/** removes a table for the seat page */
export async function finishTable(table_id, signal) {
  const url = `${API_BASE_URL}/tables/${table_id}/seat`;

  return await fetchJson(url, { headers, signal, method: "DELETE" }, []);
}

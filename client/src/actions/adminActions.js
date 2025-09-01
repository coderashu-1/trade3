import axios from "axios";
import { returnErrors } from "./errorActions";

// Action types
export const FETCH_PENDING_DEPOSITS = "FETCH_PENDING_DEPOSITS";
export const FETCH_PENDING_WITHDRAWS = "FETCH_PENDING_WITHDRAWS";
export const APPROVE_DEPOSIT = "APPROVE_DEPOSIT";
export const APPROVE_WITHDRAW = "APPROVE_WITHDRAW";
export const FETCH_ALL_USERS = "FETCH_ALL_USERS";
export const TOGGLE_ADMIN_STATUS = "TOGGLE_ADMIN_STATUS";
export const DELETE_USER = "DELETE_USER";
export const UPDATE_QR_CODE = "UPDATE_QR_CODE"; // ✅ added

// ----- Transactions -----
export const fetchPendingDeposits = () => async (dispatch, getState) => {
  try {
    const res = await axios.get("/api/transactions/admin/deposits", {
      headers: { "auth-token": getState().auth.token }
    });
    dispatch({ type: FETCH_PENDING_DEPOSITS, payload: res.data });
  } catch (err) {
    dispatch(returnErrors(err.response?.data, err.response?.status));
  }
};

export const fetchPendingWithdraws = () => async (dispatch, getState) => {
  try {
    const res = await axios.get("/api/transactions/admin/withdraws", {
      headers: { "auth-token": getState().auth.token }
    });
    dispatch({ type: FETCH_PENDING_WITHDRAWS, payload: res.data });
  } catch (err) {
    dispatch(returnErrors(err.response?.data, err.response?.status));
  }
};

export const approveDeposit = (transactionId) => async (dispatch, getState) => {
  try {
    await axios.post(`/api/transactions/admin/deposit/approve/${transactionId}`, {}, {
      headers: { "auth-token": getState().auth.token }
    });
    dispatch({ type: APPROVE_DEPOSIT, payload: transactionId });
  } catch (err) {
    dispatch(returnErrors(err.response?.data, err.response?.status));
  }
};

export const approveWithdraw = (transactionId) => async (dispatch, getState) => {
  try {
    await axios.post(`/api/transactions/admin/withdraw/approve/${transactionId}`, {}, {
      headers: { "auth-token": getState().auth.token }
    });
    dispatch({ type: APPROVE_WITHDRAW, payload: transactionId });
  } catch (err) {
    dispatch(returnErrors(err.response?.data, err.response?.status));
  }
};

// ----- Users -----
export const fetchAllUsers = () => async (dispatch, getState) => {
  try {
    const res = await axios.get("/api/transactions/admin/users", {
      headers: { "auth-token": getState().auth.token }
    });
    dispatch({ type: FETCH_ALL_USERS, payload: res.data });
  } catch (err) {
    dispatch(returnErrors(err.response?.data, err.response?.status));
  }
};

export const toggleAdminStatus = (userId) => async (dispatch, getState) => {
  try {
    const res = await axios.post(`/api/transactions/admin/toggle/${userId}`, {}, {
      headers: { "auth-token": getState().auth.token }
    });
    dispatch({ type: TOGGLE_ADMIN_STATUS, payload: res.data });
  } catch (err) {
    dispatch(returnErrors(err.response?.data, err.response?.status));
  }
};

export const deleteUser = (userId) => async (dispatch, getState) => {
  try {
    await axios.delete(`/api/transactions/admin/${userId}`, {
      headers: { "auth-token": getState().auth.token }
    });
    dispatch({ type: DELETE_USER, payload: userId });
  } catch (err) {
    dispatch(returnErrors(err.response?.data, err.response?.status));
  }
};

// ✅ Update QR code
export const updateQrCode = (file) => async (dispatch, getState) => {
  try {
    const formData = new FormData();
    formData.append("qr", file);

    const res = await axios.post("/api/transactions/admin/update-qr", formData, {
      headers: {
        "auth-token": getState().auth.token,
        "Content-Type": "multipart/form-data",
      },
    });

    dispatch({ type: UPDATE_QR_CODE, payload: res.data.qrCodeUrl });
  } catch (err) {
    dispatch(returnErrors(err.response?.data, err.response?.status));
  }
};

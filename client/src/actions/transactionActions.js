import axios from "axios";
import { returnErrors } from "./errorActions";
import { refreshUserData } from "./userActions";

// Deposit actions
export const CREATE_DEPOSIT_REQUEST = "CREATE_DEPOSIT_REQUEST";
export const CREATE_DEPOSIT_SUCCESS = "CREATE_DEPOSIT_SUCCESS";
export const CREATE_DEPOSIT_FAIL = "CREATE_DEPOSIT_FAIL";

// Withdraw actions
export const CREATE_WITHDRAW_REQUEST = "CREATE_WITHDRAW_REQUEST";
export const CREATE_WITHDRAW_SUCCESS = "CREATE_WITHDRAW_SUCCESS";
export const CREATE_WITHDRAW_FAIL = "CREATE_WITHDRAW_FAIL";

// Fetch all transactions
export const FETCH_TRANSACTIONS_REQUEST = "FETCH_TRANSACTIONS_REQUEST";
export const FETCH_TRANSACTIONS_SUCCESS = "FETCH_TRANSACTIONS_SUCCESS";
export const FETCH_TRANSACTIONS_FAIL = "FETCH_TRANSACTIONS_FAIL";

// ✅ Create Deposit Request
export const createDepositRequest = (userId, amount, screenshot) => async (dispatch) => {
  dispatch({ type: CREATE_DEPOSIT_REQUEST });

  try {
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("amount", amount);
    if (screenshot) formData.append("screenshot", screenshot);

    const res = await axios.post("/api/transactions/create-deposit-request", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    dispatch({
      type: CREATE_DEPOSIT_SUCCESS,
      payload: res.data,
    });

    // Refresh user info
    dispatch(refreshUserData(userId));
  } catch (err) {
    dispatch({
      type: CREATE_DEPOSIT_FAIL,
      payload: err.response?.data?.error || "Failed to create deposit",
    });
    dispatch(returnErrors(err.response?.data, err.response?.status));
  }
};

// ✅ Create Withdraw Request
export const createWithdrawRequest = (userId, { amount, accountNumber, bankName, ifscCode, accountHolderName, upiId }) => async (dispatch) => {
  dispatch({ type: CREATE_WITHDRAW_REQUEST });

  try {
    const res = await axios.post("/api/transactions/create-withdraw-request", {
      userId,
      amount,
      accountNumber,
      bankName,
      ifscCode,
      accountHolderName,
      upiId, // pass optional UPI ID
    });

    dispatch({
      type: CREATE_WITHDRAW_SUCCESS,
      payload: res.data,
    });

    // Refresh user info
    dispatch(refreshUserData(userId));
  } catch (err) {
    dispatch({
      type: CREATE_WITHDRAW_FAIL,
      payload: err.response?.data?.error || "Failed to create withdraw",
    });
    dispatch(returnErrors(err.response?.data, err.response?.status));
  }
};


// ✅ Fetch all transactions for user
export const fetchUserTransactions = (userId) => async (dispatch) => {
  dispatch({ type: FETCH_TRANSACTIONS_REQUEST });

  try {
    const res = await axios.get(`/api/transactions/user/${userId}`);
    dispatch({
      type: FETCH_TRANSACTIONS_SUCCESS,
      payload: res.data
    });
  } catch (err) {
    dispatch({ type: FETCH_TRANSACTIONS_FAIL, payload: err.response?.data?.error || "Failed to fetch transactions" });
    dispatch(returnErrors(err.response?.data, err.response?.status));
  }
};

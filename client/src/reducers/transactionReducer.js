// reducers/transactionReducer.js
import {
  CREATE_DEPOSIT_REQUEST,
  CREATE_DEPOSIT_SUCCESS,
  CREATE_DEPOSIT_FAIL,
  CREATE_WITHDRAW_REQUEST,
  CREATE_WITHDRAW_SUCCESS,
  CREATE_WITHDRAW_FAIL,
  FETCH_TRANSACTIONS_REQUEST,
  FETCH_TRANSACTIONS_SUCCESS,
  FETCH_TRANSACTIONS_FAIL,
} from "../actions/transactionActions";

const initialState = {
  loading: false,
  success: false,          // indicates if last action succeeded
  error: null,             // stores last error message
  transactionId: null,     // last deposit transaction id
  withdrawTransactionId: null, // last withdraw transaction id
  qrCodeImage: null,       // for deposit
  transactions: [],        // user transaction history
};

export default function transactionReducer(state = initialState, action) {
  switch (action.type) {
    // ================= Deposit =================
    case CREATE_DEPOSIT_REQUEST:
      return { ...state, loading: true, success: false, error: null };
    case CREATE_DEPOSIT_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        transactionId: action.payload.transactionId,
        qrCodeImage: action.payload.qrCodeImage,
        error: null,
      };
    case CREATE_DEPOSIT_FAIL:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
      };

    // ================= Withdraw =================
    case CREATE_WITHDRAW_REQUEST:
      return { ...state, loading: true, success: false, error: null };
    case CREATE_WITHDRAW_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        withdrawTransactionId: action.payload.transactionId,
        error: null,
      };
    case CREATE_WITHDRAW_FAIL:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
      };

    // ================ Fetch Transactions ================
    case FETCH_TRANSACTIONS_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_TRANSACTIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        transactions: action.payload,
      };
    case FETCH_TRANSACTIONS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // ================= Default =================
    default:
      return state;
  }
}

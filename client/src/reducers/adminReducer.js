import {
  FETCH_PENDING_DEPOSITS,
  FETCH_PENDING_WITHDRAWS,
  APPROVE_DEPOSIT,
  APPROVE_WITHDRAW,
  FETCH_ALL_USERS,
  TOGGLE_ADMIN_STATUS,
  DELETE_USER,
  UPDATE_QR_CODE,
  RESET_USER_PASSWORD, // ✅ new
} from "../actions/adminActions";

const initialState = {
  deposits: [],
  withdraws: [],
  users: [],
  qrCodeUrl: "/static/qr.png", // ✅ default QR
  resetPasswordMessage: null,  // ✅ store success message
};

export default function adminReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_PENDING_DEPOSITS:
      return { ...state, deposits: action.payload };

    case FETCH_PENDING_WITHDRAWS:
      return { ...state, withdraws: action.payload };

    case APPROVE_DEPOSIT:
      return {
        ...state,
        deposits: state.deposits.filter((tx) => tx._id !== action.payload),
      };

    case APPROVE_WITHDRAW:
      return {
        ...state,
        withdraws: state.withdraws.filter((tx) => tx._id !== action.payload),
      };

    case FETCH_ALL_USERS:
      return { ...state, users: action.payload };

    case TOGGLE_ADMIN_STATUS:
      return {
        ...state,
        users: state.users.map((user) =>
          user._id === action.payload._id ? action.payload : user
        ),
      };

    case DELETE_USER:
      return {
        ...state,
        users: state.users.filter((user) => user._id !== action.payload),
      };

    case UPDATE_QR_CODE:
      return {
        ...state,
        // ✅ Append timestamp so browser always fetches the fresh image
        qrCodeUrl: `${action.payload}?t=${Date.now()}`,
      };

    case RESET_USER_PASSWORD:
      return {
        ...state,
        // ✅ store the message returned from API after password reset
        resetPasswordMessage: action.payload.message,
      };

    default:
      return state;
  }
}

import { combineReducers } from "redux";
import stockReducer from "./stockReducer";
import authReducer from "./authReducer";
import errorReducer from "./errorReducer";
import userReducer from "./userReducer";
import loadingReducer from "./loadingReducer";
import transactionReducer from "./transactionReducer"; // ✅ existing
import adminReducer from "./adminReducer"; // ✅ new

export default combineReducers({
  stock: stockReducer,
  error: errorReducer,
  auth: authReducer,
  user: userReducer,
  loading: loadingReducer,
  transaction: transactionReducer, // ✅ existing
  admin: adminReducer, // ✅ added for admin panel
});

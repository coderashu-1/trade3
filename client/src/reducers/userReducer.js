import { REFRESH_USER_DATA } from "../actions/types";

const initialState = {
  user: null,
  balance: ""
};

export default function(state = initialState, action) {
  switch (action.type) {
    case REFRESH_USER_DATA:
      return {
        ...state,
        user: {
          ...state.user,       // keep existing fields if any
          ...action.payload    // overwrite with fresh data from backend
        },
        balance: action.payload.balance || state.balance
      };

    default:
      return state;
  }
}

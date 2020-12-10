import { createActions } from "redux-actions";

const actions = createActions({
  SET_USER_UID: (args:any) => args,
  SET_USER_PROPERTIES: (args:any) => args,
});

export default actions;

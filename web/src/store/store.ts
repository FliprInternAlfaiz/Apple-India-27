import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authSlice from "./reducer/authSlice";
import { persistReducer, persistStore } from "redux-persist";
import storageSession from "./storage";

const rootReducer = combineReducers({
  auth: authSlice,

});

const persistedReducer = persistReducer(
  { key: "root", storage: storageSession },
  rootReducer
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

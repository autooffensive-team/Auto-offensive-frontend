import { configureStore } from "@reduxjs/toolkit";

import { baseApi } from "@/lib/redux/services/base-api";
import { scanLogStreamReducer } from "@/lib/redux/services/userdashboard/scanner/scan-log-stream-slice";

export function makeStore() {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      scanLogStream: scanLogStreamReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

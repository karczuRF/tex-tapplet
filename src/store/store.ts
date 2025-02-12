import { configureStore } from "@reduxjs/toolkit"
import { providerReducer } from "./provider/provider.slice"
import { listenerMiddleware } from "./store.listener"
import { errorReducer } from "./error/error.slice"
import { accountReducer } from "./account/account.slice"
import { tokenReducer } from "./tokens/token.slice"

export const store = configureStore({
  reducer: {
    provider: providerReducer,
    error: errorReducer,
    account: accountReducer,
    tokens: tokenReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).prepend(listenerMiddleware.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

/* eslint-disable @typescript-eslint/no-unused-vars */
import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { listenerMiddleware } from "../store.listener"
import { initializeAction, setAccountAction } from "./account.action"
import {
  InitAccountFailurePayload,
  InitAccountRequestPayload,
  InitAccountSuccessPayload,
  AccountStoreState,
  SetAccountRequestPayload,
  SetAccountSuccessPayload,
  SetAccountFailurePayload,
} from "./account.types"

const initialState: AccountStoreState = {
  isInitialized: false,
  account: null,
  tokens: [],
}

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    initializeRequest: (_, _action: PayloadAction<InitAccountRequestPayload>) => {},
    initializeSuccess: (state, action: PayloadAction<InitAccountSuccessPayload>) => {
      state.isInitialized = true
      state.account = action.payload.account
      state.tokens = action.payload.tokens
    },
    initializeFailure: (_, _action: PayloadAction<InitAccountFailurePayload>) => {},
    setAccountRequest: (_, _action: PayloadAction<SetAccountRequestPayload>) => {},
    setAccountSuccess: (state, action: PayloadAction<SetAccountSuccessPayload>) => {
      state.isInitialized = true
      state.account = action.payload.account
      state.tokens = action.payload.tokens
    },
    setAccountFailure: (_, _action: PayloadAction<SetAccountFailurePayload>) => {},
  },
})

export const accountActions = accountSlice.actions
export const accountReducer = accountSlice.reducer

listenerMiddleware.startListening(initializeAction())
listenerMiddleware.startListening(setAccountAction())

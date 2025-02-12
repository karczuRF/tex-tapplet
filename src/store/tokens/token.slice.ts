/* eslint-disable @typescript-eslint/no-unused-vars */
import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { listenerMiddleware } from "../store.listener"
import { initializeAction, setTokensAction } from "./token.action"
import {
  InitTokenFailurePayload,
  InitTokenRequestPayload,
  InitTokenSuccessPayload,
  SetTokenFailurePayload,
  SetTokenRequestPayload,
  SetTokenSuccessPayload,
  TokenStoreState,
} from "./token.types"

const initialState: TokenStoreState = {
  isInitialized: false,
  tokens: [],
}

const tokenSlice = createSlice({
  name: "token",
  initialState,
  reducers: {
    initializeRequest: (_, _action: PayloadAction<InitTokenRequestPayload>) => {},
    initializeSuccess: (state, action: PayloadAction<InitTokenSuccessPayload>) => {
      state.tokens = action.payload.tokens
    },
    initializeFailure: (_, _action: PayloadAction<InitTokenFailurePayload>) => {},
    setTokenRequest: (_, _action: PayloadAction<SetTokenRequestPayload>) => {},
    setTokenSuccess: (state, action: PayloadAction<SetTokenSuccessPayload>) => {
      state.tokens = action.payload.tokens
    },
    setTokenFailure: (_, _action: PayloadAction<SetTokenFailurePayload>) => {},
  },
})

export const tokenActions = tokenSlice.actions
export const tokenReducer = tokenSlice.reducer

listenerMiddleware.startListening(initializeAction())
listenerMiddleware.startListening(setTokensAction())

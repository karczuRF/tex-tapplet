/* eslint-disable @typescript-eslint/no-unused-vars */
import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { listenerMiddleware } from "../store.listener"
import { initializeAction, setExistingTexAction, setTexAction, setTokensAction } from "./token.action"
import {
  InitTokenFailurePayload,
  InitTokenRequestPayload,
  InitTokenSuccessPayload,
  SetTexRequestPayload,
  SetTexSuccessPayload,
  SetTokenFailurePayload,
  SetTokenRequestPayload,
  SetTokenSuccessPayload,
  TokenStoreState,
} from "./token.types"

const initialState: TokenStoreState = {
  tokens: [],
  texAddress: undefined,
}

const tokenSlice = createSlice({
  name: "tokens",
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
    setTexRequest: (_, _action: PayloadAction<SetTexRequestPayload>) => {},
    setExistingTexRequest: (_, _action: PayloadAction<SetTexRequestPayload>) => {},
    setTexSuccess: (state, action: PayloadAction<SetTexSuccessPayload>) => {
      state.texAddress = action.payload.texAddress
    },
  },
})

export const tokenActions = tokenSlice.actions
export const tokenReducer = tokenSlice.reducer

listenerMiddleware.startListening(initializeAction())
listenerMiddleware.startListening(setTokensAction())
listenerMiddleware.startListening(setTexAction())
listenerMiddleware.startListening(setExistingTexAction())

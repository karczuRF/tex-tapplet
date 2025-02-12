import { ListenerEffectAPI, PayloadAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import { tokenActions } from "./token.slice"

import { errorActions } from "../error/error.slice"
import { RootState } from "../store"

import { ErrorSource } from "../error/error.types"
import { InitTokenRequestPayload, SetTokenRequestPayload } from "./token.types"

export const initializeAction = () => ({
  actionCreator: tokenActions.initializeRequest,
  effect: async (
    _action: PayloadAction<InitTokenRequestPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    try {
      listenerApi.dispatch(
        tokenActions.setTokenSuccess({
          tokens: [],
        })
      )
    } catch (error) {
      listenerApi.dispatch(
        errorActions.showError({ message: "failed-to-init-tokens", errorSource: ErrorSource.FRONTEND })
      )
      listenerApi.dispatch(tokenActions.initializeFailure({ errorMsg: error as string }))
    }
  },
})

export const setTokensAction = () => ({
  actionCreator: tokenActions.setTokenRequest,
  effect: async (
    action: PayloadAction<SetTokenRequestPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    try {
      const state = listenerApi.getState() as RootState
      const updatedTokens = [...state.tokens.tokens, action.payload.token]

      listenerApi.dispatch(
        tokenActions.setTokenSuccess({
          tokens: updatedTokens,
        })
      )
    } catch (error) {
      listenerApi.dispatch(
        errorActions.showError({ message: "failed-to-add-token", errorSource: ErrorSource.FRONTEND })
      )
      listenerApi.dispatch(tokenActions.setTokenFailure({ errorMsg: error as string }))
    }
  },
})

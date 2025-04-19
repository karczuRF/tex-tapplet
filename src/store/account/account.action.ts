/* eslint-disable @typescript-eslint/no-explicit-any */
import { ListenerEffectAPI, PayloadAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import { accountActions } from "./account.slice"

import { errorActions } from "../error/error.slice"
import { RootState } from "../store"

import { ErrorSource } from "../error/error.types"
import { InitAccountRequestPayload, SetAccountRequestPayload } from "./account.types"
import { Token } from "../../templates/types"

export const initializeAction = () => ({
  actionCreator: accountActions.initializeRequest,
  effect: async (
    _action: PayloadAction<InitAccountRequestPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    try {
      const dispatch = listenerApi.dispatch
      const state = listenerApi.getState() as RootState
      const provider = state.provider.provider
      console.log("[TEX][STORE] INIT ACC PROVIDER", provider)

      if (!provider) {
        dispatch(errorActions.showError({ message: "failed-to-find-provider", errorSource: ErrorSource.FRONTEND }))
        return
      }
      console.log("[TEX][STORE] GET ACC")
      const acc = await provider.getAccount()
      const accountTokens: Token[] = acc.resources.map((t) => ({
        substate: {
          resource: t.resource_address,
          component: "",
        },
        symbol: t.token_symbol,
        totalSupply: t.balance, //TODO fetch totalsupply
        balance: t.balance,
      }))
      console.log("[TEX][STORE] GET ACC OK", acc)
      listenerApi.dispatch(
        accountActions.setAccountSuccess({
          account: {
            account: {
              address: acc.address as any,
              is_default: true,
              key_index: acc.account_id,
              name: "default",
            },
            public_key: acc.public_key,
          },
          tokens: accountTokens,
        })
      )
      // console.log("ACCOUNT ACTION UPDATED TOKENS", updatedTokens)
      // listenerApi.dispatch(
      //   tokenActions.setTokenSuccess({
      //     tokens: updatedTokens,
      //   })
      // )
    } catch (error) {
      listenerApi.dispatch(accountActions.initializeFailure({ errorMsg: error as string }))
    }
  },
})

export const setAccountAction = () => ({
  actionCreator: accountActions.setAccountRequest,
  effect: async (
    action: PayloadAction<SetAccountRequestPayload>,
    listenerApi: ListenerEffectAPI<unknown, ThunkDispatch<unknown, unknown, UnknownAction>, unknown>
  ) => {
    try {
      const dispatch = listenerApi.dispatch
      const state = listenerApi.getState() as RootState
      const provider = state.provider.provider

      if (!provider) {
        dispatch(errorActions.showError({ message: "failed-to-find-provider", errorSource: ErrorSource.FRONTEND }))
        return
      }

      // if tapplet uses TU Provider it gets default account
      // this is to make sure tapplet uses the account selected by the user
      // await provider.client.accountsSetDefault({
      //   account: {
      //     Name: action.payload.accountName,
      //   },
      // })
      // const account = await provider.client.accountsGet({
      //   name_or_address: { Name: action.payload.accountName },
      // })
      const acc = await provider.getAccount()
      const accountTokens: Token[] = acc.resources.map((t) => ({
        substate: {
          resource: t.resource_address,
          component: "",
        },
        symbol: t.token_symbol,
        totalSupply: t.balance, //TODO fetch totalsupply
        balance: t.balance,
      }))

      listenerApi.dispatch(
        accountActions.setAccountSuccess({
          account: {
            account: {
              address: acc.address as any,
              is_default: true,
              key_index: acc.account_id,
              name: action.payload.accountName,
            },
            public_key: acc.public_key,
          },
          tokens: accountTokens,
        })
      )
    } catch (error) {
      listenerApi.dispatch(accountActions.setAccountFailure({ errorMsg: error as string }))
    }
  },
})

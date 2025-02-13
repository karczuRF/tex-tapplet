import { AccountInfo } from "@tari-project/typescript-bindings"
import { Token } from "../../templates/types"

export type AccountStoreState = {
  isInitialized: boolean
  account: AccountInfo | null
  tokens: Token[]
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type InitAccountRequestPayload = {}
export type InitAccountFailurePayload = {
  errorMsg: string
}
export type InitAccountSuccessPayload = {
  account: AccountInfo
  tokens: Token[]
}

export type SetAccountRequestPayload = {
  accountName: string
}
export type SetAccountSuccessPayload = {
  account: AccountInfo
  tokens: Token[]
}
export type SetAccountFailurePayload = {
  errorMsg: string
}

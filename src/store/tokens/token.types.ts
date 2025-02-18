import { Token } from "../../templates/types"

export type TokenStoreState = {
  texAddress?: string
  tokens: Token[]
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type InitTokenRequestPayload = {}
export type InitTokenFailurePayload = {
  errorMsg: string
}
export type InitTokenSuccessPayload = {
  tokens: Token[]
}
export type SetTokenRequestPayload = {
  token: Token
}
export type SetTokenSuccessPayload = {
  tokens: Token[]
}
export type SetTokenFailurePayload = {
  errorMsg: string
}
export type SetTexRequestPayload = {
  texAddress: string
}
export type SetTexSuccessPayload = {
  texAddress: string
}

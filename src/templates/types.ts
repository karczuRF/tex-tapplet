export interface Bucket {
  BucketId: number
}

export type InitTokensResponse = {
  firstToken: Token
  secondToken: Token
}

export type TokenSubstate = {
  resource: string
  component: string
}

export type Token = {
  substate: TokenSubstate
  symbol: string
  balance: number
}

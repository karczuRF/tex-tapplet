import { AccountTemplate } from "@tari-project/tarijs/dist/templates/index"
import {
  Amount,
  buildTransactionRequest,
  fromWorkspace,
  submitAndWaitForTransaction,
  TariProvider,
  TariUniverseProvider,
  Transaction,
  TransactionBuilder,
} from "@tari-project/tarijs"
import { TexTemplate } from "../templates/Tex"
import { Token } from "../templates/types"
import { CoinTemplate } from "../templates/Coin"
import { getAcceptResultSubstates } from "@tari-project/tarijs/dist/builders/helpers/submitTransaction"

export const FEE_AMOUNT = "2000"
export const INIT_SUPPLY = "100000"
export const FAUCET_TEMPLATE_ADDRESS = "1d51f2081c9fc77637d9c9b8be21697ffbd345a7a7f3a39abb76573ca5b61e16"

export const FIRST_TOKEN_RESOURCE_ADDRESS = "resource_902fabadddb86d50beca3d1ed3d8c0eece92767f166f816d227f1a7d"
export const FIRST_TOKEN_COMPONENT_ADDRESS = "component_902fabadddb86d50beca3d1ed3d8c0eece92767f2b9b43034d554c34"
export const FIRST_TOKEN_SYMBOL = "A"

export const SECOND_TOKEN_RESOURCE_ADDRESS = "resource_e1263a8f6fd826bb3d8482bd84a7f6eef1ddb5db2fa21b9b3c79e39a"
export const SECOND_TOKEN_COMPONENT_ADDRESS = "component_e1263a8f6fd826bb3d8482bd84a7f6eef1ddb5db2b9b43034d554c34"
export const SECOND_TOKEN_SYMBOL = "B"

export const defaultFirstToken: Token = {
  substate: {
    resource: FIRST_TOKEN_RESOURCE_ADDRESS,
    component: FIRST_TOKEN_COMPONENT_ADDRESS,
  },
  symbol: FIRST_TOKEN_SYMBOL,
  balance: 0,
}

export const defaultSecondToken: Token = {
  substate: {
    resource: SECOND_TOKEN_RESOURCE_ADDRESS,
    component: SECOND_TOKEN_COMPONENT_ADDRESS,
  },
  symbol: SECOND_TOKEN_SYMBOL,
  balance: 0,
}

export async function createCoin(
  provider: TariUniverseProvider,
  coinTemplateAddress: string,
  initSupply: number,
  symbol: string
) {
  const account = await provider.getAccount()
  const builder = new TransactionBuilder()
  const coin = new CoinTemplate(coinTemplateAddress)
  const supply = new Amount(initSupply)

  console.log("CREATE COIN PARAMS", account, coin.templateAddress)
  const newCoinTx: Transaction = builder
    .callFunction(coin.new, [supply, symbol])
    .feeTransactionPayFromComponent(account.address, FEE_AMOUNT)
    .build()

  console.log("CREATE COIN tx", newCoinTx)
  const required_substates = [{ substate_id: account.address }]
  const req = buildTransactionRequest(newCoinTx, account.account_id, required_substates)
  const { response, result: txResult } = await submitAndWaitForTransaction(provider, req)
  console.log("CREATE COIN response", response)
  if (!response) throw new Error("Failed to create coin")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upSubstates = getAcceptResultSubstates(txResult)?.upSubstates as any[]
  if (!upSubstates) throw new Error("No up substates found")
  console.log("Up substates: ", upSubstates)
  const token: Token = {
    substate: {
      resource: upSubstates[1][0].Resource,
      component: upSubstates[3][0].Component,
    },
    symbol: symbol,
    balance: initSupply,
  }
  return token
}

export async function createTex(provider: TariProvider, texTemplateAddress: string) {
  const account = await provider.getAccount()
  const builder = new TransactionBuilder()
  const tex = new TexTemplate(texTemplateAddress)
  const swapFeeAmount = 10 //`fee` represents a percentage, so it must be between 0 and 100

  const transaction: Transaction = builder.callFunction(tex.newTex, [swapFeeAmount]).build()

  const required_substates = [{ substate_id: account.address }]
  const req = buildTransactionRequest(transaction, account.account_id, required_substates)
  const { response, result: txResult } = await submitAndWaitForTransaction(provider, req)
  if (!response) throw new Error("Failed to create coin")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upSubstates = getAcceptResultSubstates(txResult)?.upSubstates as any[]
  if (!upSubstates) throw new Error("No up substates found")
  console.log("Up substates: ", upSubstates)
  return txResult.status
}

export async function addLiquidity(
  provider: TariProvider,
  texTemplateAddress: string,
  resourceAddressA: string,
  resourceAddressB: string,
  amountTokenA: number,
  amountTokenB: number
) {
  try {
    const account = await provider.getAccount()
    const builder = new TransactionBuilder()
    const tex = new TexTemplate(texTemplateAddress)
    const accountComponent = new AccountTemplate(account.address)
    const fee = new Amount(2000)
    const amountA = new Amount(amountTokenA)
    const amountB = new Amount(amountTokenB)

    const required_substates = [{ substate_id: account.address }, { substate_id: tex.templateAddress }]

    const transaction = builder
      .callMethod(accountComponent.withdraw, [resourceAddressA, amountA])
      .saveVar("tokenA")
      .callMethod(accountComponent.withdraw, [resourceAddressB, amountB])
      .saveVar("tokenB")
      .callMethod(tex.addLiquidity, [fromWorkspace("tokenA"), fromWorkspace("tokenB")])
      .saveVar("lptoken")
      .callMethod(accountComponent.deposit, [fromWorkspace("lptoken")])
      .callMethod(accountComponent.payFee, [fee])
      .build()

    const req = buildTransactionRequest(transaction, account.account_id, required_substates)
    const tx = await submitAndWaitForTransaction(provider, req)

    return tx.result
  } catch (error) {
    console.error(error)
  }
}

export async function removeLiquidity(
  provider: TariProvider,
  texTemplateAddress: string,
  amountLpToken: number,
  lpTokenResourceAddress: string
) {
  const account = await provider.getAccount()
  const builder = new TransactionBuilder()
  const tex = new TexTemplate(texTemplateAddress)
  const accountComponent = new AccountTemplate(account.address)
  const amountLp = new Amount(amountLpToken)
  const fee = new Amount(2000)

  const transaction = builder
    .callMethod(accountComponent.withdraw, [lpTokenResourceAddress, amountLp])
    .saveVar("lp")
    .callMethod(tex.removeLiquidity, [fromWorkspace("lp")])
    .saveVar("pool")
    .callMethod(accountComponent.deposit, [fromWorkspace("pool.0")])
    .callMethod(accountComponent.deposit, [fromWorkspace("pool.1")])
    .callMethod(accountComponent.payFee, [fee])
    .build()

  const required_substates = [{ substate_id: account.address }, { substate_id: texTemplateAddress }]
  const req = buildTransactionRequest(transaction, account.account_id, required_substates)
  const result = await submitAndWaitForTransaction(provider, req)
  return result
}

export async function swap(
  provider: TariProvider,
  texTemplateAddress: string,
  inputToken: string,
  amountInputToken: number,
  outputToken: string
) {
  const account = await provider.getAccount()
  const builder = new TransactionBuilder()
  const tex = new TexTemplate(texTemplateAddress)
  const accountComponent = new AccountTemplate(account.address)
  const amountInput = new Amount(amountInputToken)
  const fee = new Amount(2000)

  // TODO fix it
  const transaction = builder
    .callMethod(accountComponent.withdraw, [inputToken, amountInput])
    .saveVar("inputToken")
    .callMethod(tex.swap, [{ BucketId: 0 }, outputToken]) //TODO fix type error
    .saveVar("swap")
    .callMethod(accountComponent.deposit, [fromWorkspace("swap")])
    .callMethod(accountComponent.payFee, [fee])
    .build()

  const required_substates = [{ substate_id: account.address }, { substate_id: texTemplateAddress }]
  const req = buildTransactionRequest(transaction, account.account_id, required_substates)
  const result = await submitAndWaitForTransaction(provider, req)

  return result
}

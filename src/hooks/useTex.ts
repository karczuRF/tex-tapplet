/* eslint-disable @typescript-eslint/no-explicit-any */
import { AccountTemplate } from "@tari-project/tarijs/dist/templates/index"
import {
  Amount,
  buildTransactionRequest,
  ComponentAddress,
  fromWorkspace,
  ResourceAddress,
  submitAndWaitForTransaction,
  TariProvider,
  TariUniverseProvider,
  Transaction,
  TransactionBuilder,
  UpSubstates,
} from "@tari-project/tarijs"
import { TexTemplate } from "../templates/Tex"
import { Token, TokenSubstate } from "../templates/types"
import { CoinTemplate } from "../templates/Coin"
import { getAcceptResultSubstates } from "@tari-project/tarijs/dist/builders/helpers/submitTransaction"
import { substateIdToString } from "@tari-project/typescript-bindings"

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

function extractNumericPart(address: string): string {
  const match = address.match(/_(\d+)$/)
  return match ? match[1] : ""
}

// Function to find and return Token if both Resource and Component exist with the same value
function findToken(upSubstates: UpSubstates): TokenSubstate | null {
  const components: { [key: string]: ComponentAddress } = {}
  const resources: { [key: string]: ResourceAddress } = {}

  for (const [substateId] of upSubstates) {
    const substate = substateIdToString(substateId)
    if (substate.startsWith("component_")) {
      components[extractNumericPart(substate)] = substate
    }
    if (substate.startsWith("resource_")) {
      resources[extractNumericPart(substate)] = substate
    }
  }
  for (const key in components) {
    if (resources[key]) {
      return {
        component: components[key],
        resource: resources[key],
      }
    }
  }
  return null
}

export async function createCoin(
  provider: TariUniverseProvider,
  coinTemplateAddress: string,
  initSupply: number,
  symbol: string
): Promise<Token | null> {
  const account = await provider.getAccount()
  const builder = new TransactionBuilder()
  const coin = new CoinTemplate(coinTemplateAddress)
  // const supply = new Amount(initSupply)

  console.log("👋 [tapp createCoin] account", account)
  console.log("👋 [tapp createCoin] template", coin.templateAddress)
  console.log("👋 [tapp createCoin] params", initSupply, symbol)
  const tx: Transaction = builder
    .callFunction(coin.new, [initSupply, symbol])
    .feeTransactionPayFromComponent(account.address, FEE_AMOUNT)
    .build()

  console.log("👋 [tapp createCoin] new coin tx", tx)
  const required_substates = [{ substate_id: account.address }]
  const req = buildTransactionRequest(tx, account.account_id, required_substates, [], false, 0x10)
  const { response, result: txResult } = await submitAndWaitForTransaction(provider, req)
  console.log("👋 [tapp createCoin] tx resulrt", txResult)
  console.log("👋 [tapp createCoin] tx response", response)
  if (!response) throw new Error("Failed to create coin")

  const upSubstates = getAcceptResultSubstates(txResult)?.upSubstates
  if (!upSubstates) throw new Error("No up substates found")
  console.log("👋 [tapp createCoin] Up substates: ", upSubstates)
  const tokenSubstate = findToken(upSubstates)

  return tokenSubstate
    ? {
        substate: tokenSubstate,
        symbol: symbol,
        balance: initSupply,
      }
    : null
}

export async function createTex(provider: TariProvider, texTemplateAddress: string) {
  const account = await provider.getAccount()
  const builder = new TransactionBuilder()
  const tex = new TexTemplate(texTemplateAddress)
  const swapFeeAmount = 10 //`fee` represents a percentage, so it must be between 0 and 100

  const tx: Transaction = builder
    .callFunction(tex.new, [swapFeeAmount])
    .feeTransactionPayFromComponent(account.address, FEE_AMOUNT)
    .build()

  const required_substates = [{ substate_id: account.address }]
  const req = buildTransactionRequest(tx, account.account_id, required_substates, [], false, 0x10)
  const { response, result: txResult } = await submitAndWaitForTransaction(provider, req)
  if (!response) throw new Error("Failed to create coin")

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

    const tx = builder
      .callMethod(accountComponent.withdraw, [resourceAddressA, amountA])
      .saveVar("tokenA")
      .callMethod(accountComponent.withdraw, [resourceAddressB, amountB])
      .saveVar("tokenB")
      .callMethod(tex.addLiquidity, [fromWorkspace("tokenA"), fromWorkspace("tokenB")])
      .saveVar("lptoken")
      .callMethod(accountComponent.deposit, [fromWorkspace("lptoken")])
      .callMethod(accountComponent.payFee, [fee])
      .feeTransactionPayFromComponent(account.address, FEE_AMOUNT)
      .build()

    const req = buildTransactionRequest(tx, account.account_id, required_substates, [], false, 0x10)
    const result = await submitAndWaitForTransaction(provider, req)
    return result
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

  const tx = builder
    .callMethod(accountComponent.withdraw, [lpTokenResourceAddress, amountLp])
    .saveVar("lp")
    .callMethod(tex.removeLiquidity, [fromWorkspace("lp")])
    .saveVar("pool")
    .callMethod(accountComponent.deposit, [fromWorkspace("pool.0")])
    .callMethod(accountComponent.deposit, [fromWorkspace("pool.1")])
    .callMethod(accountComponent.payFee, [fee])
    .build()

  const required_substates = [{ substate_id: account.address }, { substate_id: texTemplateAddress }]
  const req = buildTransactionRequest(tx, account.account_id, required_substates, [], false, 0x10)
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
  const tx = builder
    .callMethod(accountComponent.withdraw, [inputToken, amountInput])
    .saveVar("inputToken")
    .callMethod(tex.swap, [{ BucketId: 0 }, outputToken]) //TODO fix type error
    .saveVar("swap")
    .callMethod(accountComponent.deposit, [fromWorkspace("swap")])
    .callMethod(accountComponent.payFee, [fee])
    .build()

  const required_substates = [{ substate_id: account.address }, { substate_id: texTemplateAddress }]
  const req = buildTransactionRequest(tx, account.account_id, required_substates, [], false, 0x10)
  const result = await submitAndWaitForTransaction(provider, req)

  return result
}

export async function takeFreeCoins(provider: TariUniverseProvider, coinTemplateAddress: string, amount: number) {
  const account = await provider.getAccount()
  const builder = new TransactionBuilder()
  const coin = new CoinTemplate(coinTemplateAddress)
  const accountComponent = new AccountTemplate(account.address)

  console.log("👋 [tapp takeFreeCoins] account", account)
  console.log("👋 [tapp takeFreeCoins] coin template as arg", coinTemplateAddress)
  console.log("👋 [tapp takeFreeCoins] coin.templateAddress", coin.templateAddress)
  console.log("👋 [tapp takeFreeCoins] params", account)
  const required_substates = [{ substate_id: account.address }, { substate_id: coin.templateAddress }]
  console.log("👋 [tapp takeFreeCoins] required substate", required_substates)

  const txb: Transaction = builder
    .addInput({ substateId: coinTemplateAddress as any })
    .callMethod(coin.totalSupply, [])
    .feeTransactionPayFromComponent(account.address, FEE_AMOUNT)
    .build()
  console.log("👋 [tapp takeFreeCoins] TOTAL SUPPLY TX", txb)
  const reqb = buildTransactionRequest(txb, account.account_id, required_substates, [], false, 0x10)
  const { response: bb, result: txResultb } = await submitAndWaitForTransaction(provider, reqb)
  console.log("👋 [tapp takeFreeCoins] TOTAL SUPPLY RESPONSE", txb, txResultb, bb)

  const tx: Transaction = builder
    .callMethod(coin.takeFreeCoins, [amount])
    .saveVar("coin")
    .callMethod(accountComponent.deposit, [fromWorkspace("coin")])
    .feeTransactionPayFromComponent(account.address, FEE_AMOUNT)
    .build()

  console.log("👋 [tapp takeFreeCoins] new coin tx", tx)
  console.log("👋 [tapp takeFreeCoins] required substate", required_substates)
  const req = buildTransactionRequest(tx, account.account_id, required_substates, [], false, 0x10)
  const { response, result: txResult } = await submitAndWaitForTransaction(provider, req)
  console.log("👋 [tapp takeFreeCoins] tx resulrt", txResult)
  console.log("👋 [tapp takeFreeCoins] tx response", response)
  if (!response) throw new Error("Failed to create coin: no response found")

  const upSubstates = getAcceptResultSubstates(txResult)?.upSubstates as any[]
  if (!upSubstates) console.warn("👋 [tapp takeFreeCoins] No up susbsates found")
  console.log("👋 [tapp takeFreeCoins] Up substates: ", upSubstates)

  return txResult
}

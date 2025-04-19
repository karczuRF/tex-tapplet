/* eslint-disable @typescript-eslint/no-explicit-any */
import {
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
import { substateIdToString } from "@tari-project/typescript-bindings"
import { getAcceptResultSubstates } from "@tari-project/tarijs-builders/dist/helpers/submitTransaction"
import { AccountTemplate } from "../templates/Account"

export enum Network {
  MainNet = 0x00,
  StageNet = 0x01,
  NextNet = 0x02,
  LocalNet = 0x10,
  Igor = 0x24,
  Esmeralda = 0x26,
}

export const FEE_AMOUNT = "2000"
export const INIT_SUPPLY = "100000"
export const NETWORK = Network.Igor

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

  console.log("👋 [tapp][createCoin] account", account)
  console.log("👋 [tapp][createCoin] template", coin.templateAddress)
  console.log("👋 [tapp][createCoin] params", initSupply, symbol)
  const tx: Transaction = builder
    .callFunction(coin.new, [initSupply, symbol])
    .feeTransactionPayFromComponent(account.address, FEE_AMOUNT)
    .build()

  console.log("👋 [tapp createCoin] new coin tx", tx)
  const required_substates = [{ substate_id: account.address }]
  const req = buildTransactionRequest(tx, account.account_id, required_substates, [], false, NETWORK)
  const { response, result: txResult } = await submitAndWaitForTransaction(provider, req)
  if (txResult.status === 3) {
    console.log("✅ [tapp] tx accepted result", txResult)
  } else {
    console.log("❌ [tapp] tx rejected result", txResult)
  }
  console.log("👋 [tapp][createCoin] tx response", response)
  if (!response) throw new Error("Failed to create coin")

  const upSubstates = getAcceptResultSubstates(txResult)?.upSubstates
  if (!upSubstates) throw new Error("No up substates found")
  console.log("👋 [tapp][createCoin] Up substates: ", upSubstates)
  const tokenSubstate = findToken(upSubstates)

  return tokenSubstate
    ? {
        substate: tokenSubstate,
        symbol: symbol,
        totalSupply: initSupply,
        balance: 0,
      }
    : null
}

export async function createTex(provider: TariProvider, texTemplateAddress: string): Promise<string> {
  const account = await provider.getAccount()
  const builder = new TransactionBuilder()
  const tex = new TexTemplate(texTemplateAddress)
  const swapFeeAmount = 10 //`fee` represents a percentage, so it must be between 0 and 100

  const tx: Transaction = builder
    .callFunction(tex.new, [swapFeeAmount])
    .feeTransactionPayFromComponent(account.address, FEE_AMOUNT)
    .build()

  const required_substates = [{ substate_id: account.address }]
  const req = buildTransactionRequest(tx, account.account_id, required_substates, [], false, NETWORK)
  const { response, result: txResult } = await submitAndWaitForTransaction(provider, req)
  if (!response) throw new Error("Failed to create coin")
  if (txResult.status === 3) {
    console.log("✅ [tapp] tx accepted result", txResult)
  } else {
    console.log("❌ [tapp] tx rejected result", txResult)
  }

  const upSubstates = getAcceptResultSubstates(txResult)?.upSubstates as any[]
  if (!upSubstates) throw new Error("No up substates found")
  const tst = upSubstates.find((s) => substateIdToString(s[0]).startsWith("component_"))[0]
  console.log("Up substates: ", tst, upSubstates)
  return upSubstates.find((s) => substateIdToString(s[0]).startsWith("component_"))[0]
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

    const required_substates = [{ substate_id: account.address }, { substate_id: tex.templateAddress }]
    const tx = builder
      .callMethod(accountComponent.withdraw, [resourceAddressA, amountTokenA])
      .saveVar("tokenA")
      .callMethod(accountComponent.withdraw, [resourceAddressB, amountTokenB])
      .saveVar("tokenB")
      .callMethod(tex.addLiquidity, [fromWorkspace("tokenA"), fromWorkspace("tokenB")])
      .saveVar("lptoken")
      .callMethod(accountComponent.deposit, [fromWorkspace("lptoken")])
      .feeTransactionPayFromComponent(account.address, FEE_AMOUNT)
      .build()

    console.log("👋 [tapp][addLiq] tx result", tx)
    const req = buildTransactionRequest(tx, account.account_id, required_substates, [], false, NETWORK)
    const { response, result } = await submitAndWaitForTransaction(provider, req)
    if (result.status === 3) {
      console.log("✅ [tapp] tx accepted result", result)
    } else {
      console.log("❌ [tapp] tx rejected result", result)
    }
    console.log("👋 [tapp][addLiq] tx response", response)
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

  const tx = builder
    .callMethod(accountComponent.withdraw, [lpTokenResourceAddress, amountLpToken])
    .saveVar("lp")
    .callMethod(tex.removeLiquidity, [fromWorkspace("lp")])
    .saveVar("pool")
    .callMethod(accountComponent.deposit, [fromWorkspace("pool.0")])
    .callMethod(accountComponent.deposit, [fromWorkspace("pool.1")])
    .feeTransactionPayFromComponent(account.address, FEE_AMOUNT)
    .build()

  const required_substates = [{ substate_id: account.address }, { substate_id: texTemplateAddress }]
  const req = buildTransactionRequest(tx, account.account_id, required_substates, [], false, NETWORK)
  const { response, result } = await submitAndWaitForTransaction(provider, req)
  if (result.status === 3) {
    console.log("✅ [tapp] tx accepted result", result)
  } else {
    console.log("❌ [tapp] tx rejected result", result)
  }
  console.log("👋 [tapp][remove lp] tx response", response)
  return result
}

export async function swap(
  provider: TariProvider,
  texComponentAddress: string,
  inputTokenAddress: string,
  inputTokenAmount: number,
  outputTokenAddress: string
) {
  const account = await provider.getAccount()
  const builder = new TransactionBuilder()
  const tex = new TexTemplate(texComponentAddress)
  const accountComponent = new AccountTemplate(account.address)

  const tx = builder
    .callMethod(accountComponent.withdraw, [inputTokenAddress, inputTokenAmount])
    .saveVar("inputToken")
    .callMethod(tex.swap, [fromWorkspace("inputToken"), outputTokenAddress])
    .saveVar("swap")
    .callMethod(accountComponent.deposit, [fromWorkspace("swap")])
    .feeTransactionPayFromComponent(account.address, FEE_AMOUNT)
    .build()

  const required_substates = [{ substate_id: account.address }, { substate_id: texComponentAddress }]
  const req = buildTransactionRequest(tx, account.account_id, required_substates, [], false, NETWORK)
  const { response, result } = await submitAndWaitForTransaction(provider, req)
  if (result.status === 3) {
    console.log("✅ [tapp] tx accepted result", result)
  } else {
    console.log("❌ [tapp] tx rejected result", result)
  }
  console.log("👋 [tapp][SWAP] tx response", response)
  return result
}

export async function takeFreeCoins(provider: TariUniverseProvider, coinTemplateAddress: string, amount: number) {
  const account = await provider.getAccount()
  const builder = new TransactionBuilder()
  const coin = new CoinTemplate(coinTemplateAddress)
  const accountComponent = new AccountTemplate(account.address)

  console.log("👋 [tapp][takeFreeCoins] account", account)
  console.log("👋 [tapp][takeFreeCoins] coin template as arg", coinTemplateAddress)
  console.log("👋 [tapp][takeFreeCoins] coin.templateAddress", coin.templateAddress)
  console.log("👋 [tapp][takeFreeCoins] params", account)
  const required_substates = [{ substate_id: account.address }, { substate_id: coin.templateAddress }]
  console.log("👋 [tapp][takeFreeCoins] required substate", required_substates)

  const txb: Transaction = builder
    .addInput({ substateId: coinTemplateAddress as any })
    .callMethod(coin.totalSupply, [])
    .feeTransactionPayFromComponent(account.address, FEE_AMOUNT)
    .build()
  console.log("👋 [tapp][takeFreeCoins] TOTAL SUPPLY TX", txb)
  const reqb = buildTransactionRequest(txb, account.account_id, required_substates, [], false, NETWORK)
  const { response: bb, result: txResultb } = await submitAndWaitForTransaction(provider, reqb)
  console.log("👋 [tapp][takeFreeCoins] TOTAL SUPPLY RESPONSE", txb, txResultb, bb)

  const tx: Transaction = builder
    .callMethod(coin.takeFreeCoins, [amount])
    .saveVar("coin")
    .callMethod(accountComponent.deposit, [fromWorkspace("coin")])
    .feeTransactionPayFromComponent(account.address, FEE_AMOUNT)
    .build()

  console.log("👋 [tapp][takeFreeCoins] new coin tx", tx)
  console.log("👋 [tapp][takeFreeCoins] required substate", required_substates)
  const req = buildTransactionRequest(tx, account.account_id, required_substates, [], false, NETWORK)
  const { response, result: txResult } = await submitAndWaitForTransaction(provider, req)
  if (txResult.status === 3) {
    console.log("✅ [tapp] tx accepted result", txResult)
  } else {
    console.log("❌ [tapp] tx rejected result", txResult)
  }
  console.log("👋 [tapp][takeFreeCoins] tx response", response)
  if (!response) throw new Error("Failed to create coin: no response found")

  const upSubstates = getAcceptResultSubstates(txResult)?.upSubstates as any[]
  if (!upSubstates) console.warn("👋 [tapp][takeFreeCoins] No up susbsates found")
  console.log("👋 [tapp][takeFreeCoins] Up substates: ", upSubstates)

  return txResult
}

export async function getTexPools(provider: TariProvider, texTemplateAddress: string) {
  const account = await provider.getAccount()
  const builder = new TransactionBuilder()
  const tex = new TexTemplate(texTemplateAddress)

  const tx = builder.callMethod(tex.pools, []).feeTransactionPayFromComponent(account.address, FEE_AMOUNT).build()

  const required_substates = [{ substate_id: account.address }, { substate_id: texTemplateAddress }]
  const req = buildTransactionRequest(tx, account.account_id, required_substates, [], false, NETWORK)
  const { response, result } = await submitAndWaitForTransaction(provider, req)
  if (result.status === 3) {
    console.log("✅ [tapp] tx accepted result", result)
  } else {
    console.log("❌ [tapp] tx rejected result", result)
  }
  console.log("👋 [tapp][remove lp] tx response", response)
  return result
}

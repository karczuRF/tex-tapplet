import { Box, Button, Paper, TextField, Typography } from "@mui/material"
import React, { useState } from "react"
import { createCoin, takeFreeCoins } from "../hooks/useTex"
import { TariUniverseProvider } from "@tari-project/tarijs"
import { Token } from "../templates/types"

export type InputTokensFormProps = {
  provider: TariUniverseProvider
}

export const Tokens = ({ provider }: InputTokensFormProps) => {
  const [tokenInitSupply, setTokenInitSupply] = useState("0")
  const [tokenAmount, setTokenAmount] = useState("0")
  const [tokenTemplateAddress, setTokenTemplateAddress] = useState("")
  const [tokenAddress, setTokenAddress] = useState("")
  const [tokenSymbol, setTokenSymbol] = useState("")
  const [tokenError, setTokenError] = useState("")
  const [tokensList, setTokensList] = useState<Token[]>()

  const isValidNumberInput = (input: string) => {
    return Number.isInteger(Number(input)) && input !== ""
  }

  const isValidTextInput = (input: string) => {
    return input !== ""
  }

  const handleSubmit = async () => {
    if (!isValidNumberInput(tokenInitSupply) || !isValidTextInput(tokenSymbol)) {
      throw new Error("Please enter valid token values")
    }
    console.log("provider tapplet", provider)
    const newCoin = await createCoin(provider, tokenTemplateAddress, Number(tokenInitSupply), tokenSymbol)
    if (!newCoin) return
    if (!tokensList) {
      setTokensList([newCoin])
      return
    }
    setTokensList([...tokensList, newCoin])
  }

  const handleTokenInitSupplyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (!isValidNumberInput(value)) {
      setTokenError("Please enter a valid integer value")
    } else {
      setTokenError("")
    }
    setTokenInitSupply(value)
  }

  const handleTokenTemplateAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTokenTemplateAddress(event.target.value)
  }

  const handleTokenSymbolChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTokenSymbol(event.target.value)
  }

  const handleTokenAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTokenAddress(event.target.value)
  }

  const handleTokenAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (!isValidNumberInput(value)) {
      setTokenError("Please enter a valid integer value")
    } else {
      setTokenError("")
    }
    setTokenAmount(value)
  }

  const handleTakeFreeCoins = async () => {
    if (!isValidNumberInput(tokenAmount)) {
      throw new Error("Please enter valid token values")
    }
    const resp = await takeFreeCoins(provider, tokenAddress, Number(tokenAmount))
    console.log("[TAPP take free coins] resp", resp)
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%" width="100%" gap="20px">
      <Paper
        style={{
          display: "grid",
          gridRowGap: "20px",
          padding: "20px",
        }}
      >
        <Typography variant="h4">Claim tokens</Typography>
        <TextField label="Token address" value={tokenAddress} onChange={handleTokenAddressChange} />
        <TextField
          label="Token amount"
          value={tokenAmount}
          onChange={handleTokenAmountChange}
          error={!!tokenError}
          helperText={tokenError}
          required
        />
        <Button onClick={handleTakeFreeCoins} variant={"contained"}>
          {`Claim ${tokenAmount} ${tokenSymbol}`}
        </Button>
      </Paper>
      <Paper
        style={{
          display: "grid",
          gridRowGap: "20px",
          padding: "20px",
        }}
      >
        <Typography variant="h4">Create new token</Typography>
        <TextField
          label="Token template address"
          value={tokenTemplateAddress}
          onChange={handleTokenTemplateAddressChange}
        />
        <TextField label="Token symbol" value={tokenSymbol} onChange={handleTokenSymbolChange} />
        <TextField
          label="Token init supply"
          value={tokenInitSupply}
          onChange={handleTokenInitSupplyChange}
          error={!!tokenError}
          helperText={tokenError}
          required
        />
        <Button onClick={handleSubmit} variant={"contained"}>
          {`Create token ${tokenSymbol} with init supply ${tokenInitSupply}`}
        </Button>
      </Paper>
      {tokensList && tokensList?.length > 0 ? (
        <Paper
          style={{
            display: "grid",
            gridRowGap: "20px",
            padding: "20px",
          }}
        >
          {tokensList.map((token, index) => (
            <Typography key={index} variant="h4">
              {index}. {token.symbol} {token.balance} {token.substate.component}
            </Typography>
          ))}
        </Paper>
      ) : (
        <Paper
          style={{
            display: "grid",
            gridRowGap: "20px",
            padding: "20px",
          }}
        >
          <Typography variant="h4">No tokens</Typography>
        </Paper>
      )}
    </Box>
  )
}

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material"
import React, { useState } from "react"
import { createCoin, takeFreeCoins } from "../hooks/useTex"
import { useDispatch, useSelector } from "react-redux"
import { providerSelector } from "../store/provider/provider.selector"
import { tokenActions } from "../store/tokens/token.slice"
import { tokensSelector } from "../store/tokens/token.selector"

export const Tokens = () => {
  const [tokenInitSupply, setTokenInitSupply] = useState("0")
  const [tokenAmount, setTokenAmount] = useState("0")
  const [tokenTemplateAddress, setTokenTemplateAddress] = useState("")
  const [tokenAddress, setTokenAddress] = useState("")
  const [tokenSymbol, setTokenSymbol] = useState("")
  const [tokenError, setTokenError] = useState("")
  const provider = useSelector(providerSelector.selectProvider)
  const tokensList = useSelector(tokensSelector.selectTokens)
  const dispatch = useDispatch()

  const isValidNumberInput = (input: string) => {
    return Number.isInteger(Number(input)) && input !== ""
  }

  const isValidTextInput = (input: string) => {
    return input !== ""
  }

  const handleSubmit = async () => {
    if (!provider) return
    if (!isValidNumberInput(tokenInitSupply) || !isValidTextInput(tokenSymbol)) {
      throw new Error("Please enter valid token values")
    }
    console.log("provider tapplet", provider)
    const token = await createCoin(provider, tokenTemplateAddress, Number(tokenInitSupply), tokenSymbol)
    if (!token) return
    dispatch(tokenActions.setTokenRequest({ token }))
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

  const handleTokenAddressChange = (event: SelectChangeEvent) => {
    console.info("selected token", event.target.value)
    setTokenAddress(event.target.value as string)
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
    if (!provider) return
    console.log("[TAPP take free coins] provider", provider)
    const resp = await takeFreeCoins(provider, tokenAddress, Number(tokenAmount))
    console.log("[TAPP take free coins] resp", resp)
  }

  return (
    <Box
      display="grid"
      gridTemplateColumns={"repeat(3, 1fr)"}
      gap={7}
      justifyContent="center"
      alignItems="center"
      height="100%"
      width="100%"
    >
      <Paper
        style={{
          display: "grid",
          gridRowGap: "20px",
          padding: "20px",
          width: "100%",
          height: "100%",
        }}
      >
        <Typography variant="h4">Claim free tokens</Typography>
        <FormControl fullWidth>
          <InputLabel id="select-token">Token</InputLabel>
          <Select
            labelId="select-token"
            id="token"
            value={tokenAddress}
            label="selected-token"
            onChange={handleTokenAddressChange}
          >
            {tokensList.map((token) => {
              return (
                <MenuItem value={token.substate.component} key={token.substate.component}>
                  {token.symbol} {token.substate.component}
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>
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
          width: "100%",
          height: "100%",
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
            width: "100%",
            height: "100%",
          }}
        >
          <Typography variant="h4">Created tokens</Typography>
          {tokensList.map((token, index) => (
            <Typography key={index} variant="h6">
              {index}. {token.symbol} {token.totalSupply} {token.substate.component}
            </Typography>
          ))}
        </Paper>
      ) : (
        <Paper
          style={{
            display: "grid",
            gridRowGap: "20px",
            padding: "20px",
            width: "100%",
            height: "100%",
          }}
        >
          <Typography variant="h4">No tokens</Typography>
        </Paper>
      )}
    </Box>
  )
}

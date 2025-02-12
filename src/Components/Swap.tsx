import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Switch,
  TextField,
  Typography,
} from "@mui/material"
import React, { useState } from "react"
import { TEX_COMPONENT_ADDRESS } from "../constants"
import { swap } from "../hooks/useTex"
import { useSelector } from "react-redux"
import { providerSelector } from "../store/provider/provider.selector"
import { tokensSelector } from "../store/tokens/token.selector"

export type SwapProps = {
  handleSwap: (inputToken: string, tokenAmount: number, outputToken: string) => void
  callback: () => void
}

export const Swap = ({ handleSwap, callback }: SwapProps) => {
  const provider = useSelector(providerSelector.selectProvider)
  const tokensList = useSelector(tokensSelector.selectTokens) //TODO ofc not all tokens list but only from LP

  const [tokenAmount, setTokenAmount] = useState("0")
  const [tokenAmountError, setTokenAmountError] = useState("")
  const [firstToSecond, setFirstToSecond] = useState(true)
  const [firstTokenAddress, setFirstTokenAddress] = useState("")
  const [secondTokenAddress, setSecondTokenAddress] = useState("")

  const handleChangeTokenA = (event: SelectChangeEvent) => {
    console.info("selected 1 token", event.target.value)
    setFirstTokenAddress(event.target.value as string)
  }

  const handleChangeTokenB = (event: SelectChangeEvent) => {
    console.info("selected 2 token", event.target.value)
    setSecondTokenAddress(event.target.value as string)
  }

  const isValidInput = (input: string) => {
    return Number.isInteger(Number(input))
  }

  const handleSubmit = async () => {
    if (!isValidInput(tokenAmount)) {
      throw new Error("Please enter valid integer values")
    }
    if (!provider) return
    const inputToken = firstToSecond ? firstTokenAddress : secondTokenAddress
    const outputToken = firstToSecond ? secondTokenAddress : firstTokenAddress
    await handleSwap(inputToken, Number(tokenAmount), outputToken)
    callback()
    await swap(provider, TEX_COMPONENT_ADDRESS, inputToken, Number(tokenAmount), outputToken)
  }

  const handleFirstTokenAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (!isValidInput(value)) {
      setTokenAmountError("Please enter a valid integer value")
    } else {
      setTokenAmountError("")
    }
    setTokenAmount(value)
  }

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Paper
        style={{
          display: "grid",
          gridRowGap: "20px",
          padding: "20px",
        }}
      >
        <Typography variant="h4"> Swap tokens: </Typography>
        <FormControl fullWidth>
          <InputLabel id="select-first-token">First Token</InputLabel>
          <Select
            labelId="select-first-token"
            id="first-token"
            value={firstTokenAddress}
            label="selected-token"
            onChange={handleChangeTokenA}
          >
            {tokensList.map((token) => {
              return (
                <MenuItem value={token.substate.resource} key={token.substate.resource}>
                  {token.symbol} {token.substate.resource}
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="select-second-token">Second Token</InputLabel>
          <Select
            labelId="select-second-token"
            id="second-token"
            value={secondTokenAddress}
            label="selected-token"
            onChange={handleChangeTokenB}
          >
            {tokensList.map((token) => {
              return (
                <MenuItem value={token.substate.resource} key={token.substate.resource}>
                  {token.symbol} {token.substate.resource}
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>
        <TextField
          label={firstToSecond ? "Token A amount" : "Token B amount"}
          value={tokenAmount}
          onChange={handleFirstTokenAmountChange}
          error={!!tokenAmountError}
          helperText={tokenAmountError}
          required
        />
        <Box display="flex" alignItems="center">
          <Switch value={firstToSecond} onChange={() => setFirstToSecond(!firstToSecond)} />
          <Typography>{firstToSecond ? "Token A to Token B" : "Token B to Token A"}</Typography>
        </Box>
        <Button onClick={handleSubmit} variant={"contained"}>
          Submit
        </Button>
      </Paper>
    </Box>
  )
}

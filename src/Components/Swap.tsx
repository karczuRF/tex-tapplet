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
import { swap } from "../hooks/useTex"
import { useSelector } from "react-redux"
import { providerSelector } from "../store/provider/provider.selector"
import { accountSelector } from "../store/account/account.selector"
import { tokensSelector } from "../store/tokens/token.selector"

export const Swap = () => {
  const provider = useSelector(providerSelector.selectProvider)
  //TODO ofc not all tokens list but only from LP
  const tokens = useSelector(accountSelector.selectAccountTokens)
  const tex = useSelector(tokensSelector.selectTex)
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
    if (!provider || !tex) return
    const inputToken = firstToSecond ? firstTokenAddress : secondTokenAddress
    const outputToken = firstToSecond ? secondTokenAddress : firstTokenAddress
    await swap(provider, tex, inputToken, Number(tokenAmount), outputToken)
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
    <Box display="flex" justifyContent="center" alignItems="center" height="100%" width="100%">
      <Paper
        style={{
          display: "grid",
          gridRowGap: "20px",
          padding: "20px",
          width: "100%",
          height: "100%",
        }}
      >
        <Typography variant="h4"> Swap tokens </Typography>
        <FormControl fullWidth>
          <InputLabel id="select-first-token">First Token</InputLabel>
          <Select
            labelId="select-first-token"
            id="first-token"
            value={firstTokenAddress}
            label="selected-token"
            onChange={handleChangeTokenA}
          >
            {tokens.map((token) => {
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
            {tokens.map((token) => {
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

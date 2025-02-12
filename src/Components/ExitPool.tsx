import {
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
import { removeLiquidity } from "../hooks/useTex"
import { providerSelector } from "../store/provider/provider.selector"
import { useSelector } from "react-redux"
import { TEX_COMPONENT_ADDRESS } from "../constants"
import { tokensSelector } from "../store/tokens/token.selector"

export type InputTokensFormProps = {
  onSubmit: (lpTokenAmount: number) => void
  callback: () => void
}

export const ExitPool = () => {
  const provider = useSelector(providerSelector.selectProvider)
  const tokensList = useSelector(tokensSelector.selectTokens)

  const [lpTokenAmount, setLpTokenAmount] = useState("0")
  const [lpTokenError, setLpTokenError] = useState("")
  const [lpAddress, setLpAddress] = useState("")

  const isValidInput = (input: string) => {
    return Number.isInteger(Number(input)) && input !== ""
  }

  const handleSubmit = async () => {
    if (!provider) return
    if (!isValidInput(lpTokenAmount)) {
      throw new Error("Please enter valid integer values")
    }
    // await onSubmit(Number(lpTokenAmount))
    // callback()
    await removeLiquidity(provider, TEX_COMPONENT_ADDRESS, Number(lpTokenAmount), lpAddress)
  }

  const handleLpTokenAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (!isValidInput(value)) {
      setLpTokenError("Please enter a valid integer value")
    } else {
      setLpTokenError("")
    }
    setLpTokenAmount(value)
  }

  const handleChangeLP = (event: SelectChangeEvent) => {
    setLpAddress(event.target.value)
  }
  // const handleGetTexPools = useCallback(async () => {
  //   if (!provider) return
  //   await getTexPools(provider, TEX_COMPONENT_ADDRESS)
  // }, [provider])

  // useEffect(() => {
  //   handleGetTexPools()
  // }, [account, handleGetTexPools, provider])

  return (
    <Paper
      style={{
        display: "grid",
        gridRowGap: "20px",
        padding: "20px",
      }}
    >
      <Typography variant="h4">Exit the pool with LP tokens </Typography>

      <TextField
        label="LP token amount"
        value={lpTokenAmount}
        onChange={handleLpTokenAmountChange}
        error={!!lpTokenError}
        helperText={lpTokenError}
        required
      />
      <Typography variant="h4">Exit your LP</Typography>
      <FormControl fullWidth>
        <InputLabel id="select-lp">LP</InputLabel>
        <Select labelId="select-lp" id="lp" value={lpAddress} label="selected-token" onChange={handleChangeLP}>
          {tokensList
            .filter((lp) => lp.symbol === "LP")
            .map((token) => {
              return (
                <MenuItem value={token.substate.resource} key={token.substate.resource}>
                  {token.symbol} {token.substate.resource}
                </MenuItem>
              )
            })}
        </Select>
      </FormControl>
      <Button onClick={handleSubmit} variant={"contained"}>
        Exit pool
      </Button>
    </Paper>
  )
}

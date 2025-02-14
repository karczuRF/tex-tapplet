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
import { removeLiquidity } from "../hooks/useTex"
import { providerSelector } from "../store/provider/provider.selector"
import { useSelector } from "react-redux"
import { TEX_COMPONENT_ADDRESS } from "../constants"
import { accountSelector } from "../store/account/account.selector"
import { shortenSubstateAddress } from "../helpers/address"

export type InputTokensFormProps = {
  onSubmit: (lpTokenAmount: number) => void
  callback: () => void
}

export const ExitPool = () => {
  const provider = useSelector(providerSelector.selectProvider)
  const tokens = useSelector(accountSelector.selectAccountTokens)

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

  // TODO get pools list
  // const handleGetTexPools = useCallback(async () => {
  //   if (!provider || !tex) return
  //   const res = await getTexPools(provider, tex)
  //   console.log("refresh pools done", res)
  // }, [provider, tex])

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
        <Typography variant="h4">Exit the pool with LP tokens </Typography>
        {/* <Button onClick={handleGetTexPools} variant={"contained"}>
          Refresh pools list
        </Button> */}
        <Typography variant="h4">Exit your LP</Typography>
        <FormControl fullWidth>
          <InputLabel id="select-lp">LP</InputLabel>
          <Select labelId="select-lp" id="lp" value={lpAddress} label="selected-token" onChange={handleChangeLP}>
            {tokens
              .filter((lp) => lp.symbol === "LP")
              .map((token) => {
                return (
                  <MenuItem value={token.substate.resource} key={token.substate.resource}>
                    {token.symbol} {shortenSubstateAddress(token.substate.resource ?? "")}
                  </MenuItem>
                )
              })}
          </Select>
        </FormControl>
        <TextField
          label="LP token amount"
          value={lpTokenAmount}
          onChange={handleLpTokenAmountChange}
          error={!!lpTokenError}
          helperText={lpTokenError}
          required
        />
        <Button onClick={handleSubmit} variant={"contained"}>
          Exit pool
        </Button>
      </Paper>
    </Box>
  )
}

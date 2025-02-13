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
import React, { useCallback, useState } from "react"
import { getTexPools, removeLiquidity } from "../hooks/useTex"
import { providerSelector } from "../store/provider/provider.selector"
import { useSelector } from "react-redux"
import { TEX_COMPONENT_ADDRESS } from "../constants"
import { accountSelector } from "../store/account/account.selector"
import { shortenSubstateAddress } from "../types/tapplet"
import { tokensSelector } from "../store/tokens/token.selector"

export type InputTokensFormProps = {
  onSubmit: (lpTokenAmount: number) => void
  callback: () => void
}

export const ExitPool = () => {
  const provider = useSelector(providerSelector.selectProvider)
  const tokens = useSelector(accountSelector.selectAccountTokens)
  const tex = useSelector(tokensSelector.selectTex)

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
  const handleGetTexPools = useCallback(async () => {
    if (!provider || !tex) return
    const res = await getTexPools(provider, tex) //TODO fix infinite pending tx
    console.log("refresh pools done", res)
  }, [provider, tex])

  // useEffect(() => {
  //   handleGetTexPools()
  // }, [account, handleGetTexPools, provider])

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
        <Button onClick={handleGetTexPools} variant={"contained"}>
          Refresh pools list
        </Button>
      </Paper>
    </Box>
  )
}

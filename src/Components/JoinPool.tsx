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
import { addLiquidity } from "../hooks/useTex"
import { useDispatch, useSelector } from "react-redux"
import { providerSelector } from "../store/provider/provider.selector"
import { tokensSelector } from "../store/tokens/token.selector"
import { tokenActions } from "../store/tokens/token.slice"
import { shortenSubstateAddress } from "../types/tapplet"
import { accountSelector } from "../store/account/account.selector"

export const JoinPool = () => {
  const provider = useSelector(providerSelector.selectProvider)
  const tokens = useSelector(accountSelector.selectAccountTokens)
  const tex = useSelector(tokensSelector.selectTex)
  const dispatch = useDispatch()

  const [texTemplateAddress, setTexTemplateAddress] = useState("")
  const [firstTokenAmount, setFirstTokenAmount] = useState("0")
  const [secondTokenAmount, setSecondTokenAmount] = useState("0")
  const [firstTokenError, setFirstTokenError] = useState("")
  const [secondTokenError, setSecondTokenError] = useState("")
  const [firstTokenAddress, setFirstTokenAddress] = useState("")
  const [secondTokenAddress, setSecondTokenAddress] = useState("")

  const isValidInput = (input: string) => {
    return Number.isInteger(Number(input)) && input !== ""
  }

  const handleSubmit = async () => {
    console.log("provider tapplet", provider)
    if (!provider || !tex) return
    if (!isValidInput(firstTokenAmount) || !isValidInput(secondTokenAmount)) {
      throw new Error("Please enter valid integer values")
    }
    addLiquidity(
      provider,
      tex,
      firstTokenAddress,
      secondTokenAddress,
      Number(firstTokenAmount),
      Number(secondTokenAmount)
    )
  }
  const onClickCreate = async () => {
    console.log("tapplet create tex", texTemplateAddress)
    dispatch(tokenActions.setTexRequest({ texTemplateAddress }))
  }

  const handleFirstTokenAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (!isValidInput(value)) {
      setFirstTokenError("Please enter a valid integer value")
    } else {
      setFirstTokenError("")
    }
    setFirstTokenAmount(value)
  }

  const handleSecondTokenAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (!isValidInput(value)) {
      setSecondTokenError("Please enter a valid integer value")
    } else {
      setSecondTokenError("")
    }
    setSecondTokenAmount(value)
  }

  const handleTexTemplateAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setTexTemplateAddress(value)
  }

  const handleChangeTokenA = (event: SelectChangeEvent) => {
    console.info("selected token", event.target.value)
    setFirstTokenAddress(event.target.value as string)
  }

  const handleChangeTokenB = (event: SelectChangeEvent) => {
    console.info("selected token", event.target.value)
    setSecondTokenAddress(event.target.value as string)
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%" width="100%">
      {!tex ? (
        <Paper
          style={{
            display: "grid",
            gridRowGap: "20px",
            padding: "20px",
            width: "100%",
            height: "100%",
          }}
        >
          <Typography variant="h4">No Tex found. Create new one. {tex}</Typography>
          <TextField
            label="Tex template address"
            value={texTemplateAddress}
            onChange={handleTexTemplateAddressChange}
          />
          <Button onClick={onClickCreate} variant={"contained"}>
            {`Create Tex`}
          </Button>
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
          <Typography variant="h6">TEX: {shortenSubstateAddress(tex)}</Typography>
          <Typography variant="h4">Join the pool with tokens</Typography>
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
          <TextField
            label="Token A amount"
            value={firstTokenAmount}
            onChange={handleFirstTokenAmountChange}
            error={!!firstTokenError}
            helperText={firstTokenError}
            required
          />
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
            label="Token B amount"
            value={secondTokenAmount}
            onChange={handleSecondTokenAmountChange}
            error={!!secondTokenError}
            helperText={secondTokenError}
            required
          />
          <Button onClick={handleSubmit} variant={"contained"}>
            Submit
          </Button>
        </Paper>
      )}
    </Box>
  )
}

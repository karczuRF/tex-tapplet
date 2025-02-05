import { Box, Button, Paper, TextField, Typography } from "@mui/material"
import React, { useState } from "react"
import { createCoin } from "../hooks/useTex"
import { TariUniverseProvider } from "@tari-project/tarijs"

export type InputTokensFormProps = {
  onSubmit: (firstTokenAmount: number, secondTokenAmount: number) => void
  callback: () => void
  provider: TariUniverseProvider
}

export const JoinPool = ({ onSubmit, callback, provider }: InputTokensFormProps) => {
  const [firstTokenAmount, setFirstTokenAmount] = useState("0")
  const [coinTemplateAddress, setCoinTemplateAddress] = useState("")
  const [secondTokenAmount, setSecondTokenAmount] = useState("0")
  const [firstTokenError, setFirstTokenError] = useState("")
  const [secondTokenError, setSecondTokenError] = useState("")

  const isValidInput = (input: string) => {
    return Number.isInteger(Number(input)) && input !== ""
  }

  const handleSubmit = async () => {
    if (!isValidInput(firstTokenAmount) || !isValidInput(secondTokenAmount)) {
      throw new Error("Please enter valid integer values")
    }
    console.log("provider tapplet", provider)
    await onSubmit(Number(firstTokenAmount), Number(secondTokenAmount))
    callback()
  }
  const onClickCreate = async () => {
    console.log("tapplet create coin", coinTemplateAddress)
    createCoin(provider, coinTemplateAddress, 1223, "TST")
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

  const handleCoinTemplateAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    if (!isValidInput(value)) {
      setCoinTemplateAddress("Please enter a valid address")
    } else {
      setCoinTemplateAddress("")
    }
    setCoinTemplateAddress(value)
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%" width="100%">
      <Paper
        style={{
          display: "grid",
          gridRowGap: "20px",
          padding: "20px",
        }}
      >
        <Typography variant="h4">Join the pool with tokens:</Typography>

        <TextField
          label="Token A amount"
          value={firstTokenAmount}
          onChange={handleFirstTokenAmountChange}
          error={!!firstTokenError}
          helperText={firstTokenError}
          required
        />
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

        <TextField
          label="Coin template address"
          value={coinTemplateAddress}
          onChange={handleCoinTemplateAddressChange}
        />
        <Button onClick={onClickCreate} variant={"contained"}>
          {`Create token A with init supply ${firstTokenAmount}`}
        </Button>
      </Paper>
    </Box>
  )
}

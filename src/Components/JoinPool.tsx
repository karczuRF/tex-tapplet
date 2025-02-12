import { Box, Button, Paper, TextField, Typography } from "@mui/material"
import React, { useState } from "react"
import { addLiquidity, createTex } from "../hooks/useTex"
import { useSelector } from "react-redux"
import { providerSelector } from "../store/provider/provider.selector"

export const JoinPool = () => {
  const provider = useSelector(providerSelector.selectProvider)

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
    if (!provider) return
    if (!isValidInput(firstTokenAmount) || !isValidInput(secondTokenAmount)) {
      throw new Error("Please enter valid integer values")
    }
    addLiquidity(
      provider,
      texTemplateAddress,
      firstTokenAddress,
      secondTokenAddress,
      Number(firstTokenAmount),
      Number(secondTokenAmount)
    )
  }
  const onClickCreate = async () => {
    console.log("tapplet create tex", texTemplateAddress)
    if (!provider) return
    createTex(provider, texTemplateAddress)
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

  const handleFirstTokenAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setFirstTokenAddress(value)
  }

  const handleSecondTokenAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSecondTokenAddress(value)
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
          label="Token A template address"
          value={firstTokenAddress}
          onChange={handleFirstTokenAddressChange}
        />
        <TextField
          label="Token A amount"
          value={firstTokenAmount}
          onChange={handleFirstTokenAmountChange}
          error={!!firstTokenError}
          helperText={firstTokenError}
          required
        />
        <TextField
          label="Token B template address"
          value={secondTokenAddress}
          onChange={handleSecondTokenAddressChange}
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

        <TextField label="Tex template address" value={texTemplateAddress} onChange={handleTexTemplateAddressChange} />
        <Button onClick={onClickCreate} variant={"contained"}>
          {`Create Tex`}
        </Button>
      </Paper>
    </Box>
  )
}

import { useDispatch, useSelector } from "react-redux"
import { accountSelector } from "../store/account/account.selector"
import { Box, Button, Paper, Stack, Typography } from "@mui/material"
import { substateIdToString } from "@tari-project/typescript-bindings"
import { accountActions } from "../store/account/account.slice"

export const Account = () => {
  const currentAccount = useSelector(accountSelector.selectAccount)
  const tokens = useSelector(accountSelector.selectAccountTokens)
  console.log("[TAPP][ACCOUNT] a ", currentAccount)
  const accountAddress = substateIdToString(currentAccount?.account.address ?? null)
  console.log("[TAPP][ACCOUNT] c", accountAddress)
  const dispatch = useDispatch()

  const onClick = async () => {
    dispatch(accountActions.setAccountRequest({ accountName: "default" }))
  }
  return (
    <Box
      display="grid"
      gridTemplateRows={"repeat(2, 1fr)"}
      gap={1}
      justifyContent="center"
      alignItems="center"
      height="100%"
      width="100%"
    >
      {currentAccount != null ? (
        <Paper
          style={{
            display: "grid",
            gridRowGap: "10px",
            padding: "20px",
          }}
        >
          <Typography variant="h4">Account</Typography>
          <Button onClick={onClick} variant={"contained"}>
            {`Refresh`}
          </Button>
          <Stack direction="column" justifyContent="flex-end">
            <Typography
              variant="caption"
              textAlign="left"
            >{`Id: ${currentAccount?.account?.key_index} name: ${currentAccount?.account?.name}`}</Typography>
            <Typography variant="caption" textAlign="left">{`address: ${accountAddress}`}</Typography>
          </Stack>
        </Paper>
      ) : (
        <Paper
          style={{
            display: "grid",
            gridRowGap: "20px",
            padding: "20px",
          }}
        >
          <Typography variant="h4">No account found</Typography>
        </Paper>
      )}
      <Paper
        style={{
          display: "grid",
          gridRowGap: "20px",
          padding: "20px",
        }}
      >
        {Object.entries(tokens || []).map(([key, token]) => (
          <Stack direction="column" justifyContent="flex-end">
            <Typography
              variant="caption"
              textAlign="left"
            >{`${key} Symbol: ${token.symbol} balance: ${token.balance} address: ${token.substate.resource} `}</Typography>
          </Stack>
        ))}
      </Paper>
    </Box>
  )
}

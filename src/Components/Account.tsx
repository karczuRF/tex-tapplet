import { useSelector } from "react-redux"
import { accountSelector } from "../store/account/account.selector"
import { Box, Paper, Stack, Typography } from "@mui/material"
import { substateIdToString } from "@tari-project/typescript-bindings"
import { tokensSelector } from "../store/tokens/token.selector"

// TODO this component is just tmp to show and control provider/account
export const Account = () => {
  const currentAccount = useSelector(accountSelector.selectAccount)
  const tokens = useSelector(tokensSelector.selectTokens)
  console.log("[TAPP][ACCOUNT] a ", currentAccount)
  const accountAddress = substateIdToString(currentAccount?.account.address ?? null)
  console.log("[TAPP][ACCOUNT] c", accountAddress)
  return (
    <Box sx={{ width: "100%" }}>
      {currentAccount != null ? (
        <Paper
          style={{
            display: "grid",
            gridRowGap: "20px",
            padding: "20px",
          }}
        >
          <Typography variant="h4">Account</Typography>
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
            >{`${key} Symbol: ${token.symbol} total supply: ${token.totalSupply} address: ${token.substate.resource} `}</Typography>
          </Stack>
        ))}
      </Paper>
    </Box>
  )
}

import { useSelector } from "react-redux"
import { accountSelector } from "../store/account/account.selector"
import { substateIdToString } from "@tari-project/typescript-bindings"
import { Box, Paper, Stack, Typography } from "@mui/material"

// TODO this component is just tmp to show and control provider/account
export const Account = () => {
  const currentAccount = useSelector(accountSelector.selectAccount)
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
    </Box>
  )
}

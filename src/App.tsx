import "./App.css"
import { Box, Paper, Typography } from "@mui/material"
import { ExitPool, JoinPool, Swap } from "./Components"
import {
  TariPermissions,
  TariUniverseProvider,
  TariUniverseProviderParameters,
  permissions as walletPermissions,
} from "@tari-project/tarijs"
import { useRef } from "react"

const { TariPermissionAccountInfo, TariPermissionKeyList, TariPermissionSubstatesRead, TariPermissionTransactionSend } =
  walletPermissions

const permissions = new TariPermissions()
permissions.addPermission(new TariPermissionKeyList())
permissions.addPermission(new TariPermissionAccountInfo())
permissions.addPermission(new TariPermissionTransactionSend())
permissions.addPermission(new TariPermissionSubstatesRead())
const optionalPermissions = new TariPermissions()
const params: TariUniverseProviderParameters = {
  permissions: permissions,
  optionalPermissions,
}

function App() {
  const provider = useRef<TariUniverseProvider>(new TariUniverseProvider(params))

  const handlePlaceholder = async (): Promise<void> => {}
  return (
    <Box display="flex" justifyContent="center" alignItems="center" gap={6} flexDirection="column">
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Paper variant="outlined" elevation={0} sx={{ padding: 4, margin: 3, borderRadius: 4 }}>
          <Typography variant="h6" textAlign="center">
            Pool state
          </Typography>
          <Typography>Pool token A balance: </Typography>
          <Typography>Pool token B balance: </Typography>
          <Typography>LP token total supply: </Typography>
        </Paper>
        <Paper variant="outlined" elevation={0} sx={{ padding: 4, margin: 3, borderRadius: 4 }}>
          <Typography variant="h6" textAlign="center">
            Your balances
          </Typography>
          <Typography>Your token A balance: </Typography>
          <Typography>Your token B balance: </Typography>
          <Typography>Your LP token balance: </Typography>
        </Paper>
      </Box>
      <Box display="flex" justifyContent="center" alignItems="center" width="100%" height="100%" gap={4} flexGrow={1}>
        <JoinPool onSubmit={handlePlaceholder} callback={handlePlaceholder} provider={provider.current} />
        <ExitPool onSubmit={handlePlaceholder} callback={handlePlaceholder} />
        <Swap handleSwap={handlePlaceholder} callback={handlePlaceholder} />
      </Box>
    </Box>
  )
}

export default App

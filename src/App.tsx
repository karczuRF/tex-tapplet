import "./App.css"
import { AppBar, Box, Tab, Tabs } from "@mui/material"
import { ExitPool, JoinPool, Swap } from "./Components"
import {
  TariPermissions,
  TariUniverseProvider,
  TariUniverseProviderParameters,
  permissions as walletPermissions,
} from "@tari-project/tarijs"
import { useEffect, useRef, useState } from "react"
import { Tokens } from "./Components/Tokens"
import { providerActions } from "./store/provider/provider.slice"
import { accountActions } from "./store/account/account.slice"
import { useDispatch } from "react-redux"

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

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  }
}

function App() {
  // const classes = useStyles()
  const provider = useRef<TariUniverseProvider>(new TariUniverseProvider(params))
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(providerActions.initializeRequest({}))
    dispatch(accountActions.initializeRequest({}))
  }, [])

  const [value, setValue] = useState(0)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }
  const handlePlaceholder = () => {}

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={handleChange}
          textColor="primary"
          indicatorColor="primary"
          variant="fullWidth"
          aria-label="tapplet-tabs"
        >
          <Tab label="Join Pool" {...a11yProps(0)} />
          <Tab label="Exit Pool" {...a11yProps(1)} />
          <Tab label="Swap" {...a11yProps(2)} />
          <Tab label="Tokens" {...a11yProps(3)} />
        </Tabs>
      </AppBar>
      <Box
        sx={{
          flex: 1,
          bgcolor: "background.paper",
          display: "flex",
          alignItems: "center", // Center vertically
          justifyContent: "center", // Center horizontally
          backgroundColor: "#c1c4c9",
        }}
      >
        <CustomTabPanel value={value} index={0}>
          <JoinPool onSubmit={handlePlaceholder} callback={handlePlaceholder} provider={provider.current} />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <ExitPool onSubmit={handlePlaceholder} callback={handlePlaceholder} />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          <Swap handleSwap={handlePlaceholder} callback={handlePlaceholder} />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={3}>
          <Tokens />
        </CustomTabPanel>
      </Box>
    </Box>
  )
}

export default App

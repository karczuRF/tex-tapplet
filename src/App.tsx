import "./App.css"
import { AppBar, Box, Tab, Tabs } from "@mui/material"
import { useEffect, useState } from "react"
import { Tokens } from "./Components/Tokens"
import { providerActions } from "./store/provider/provider.slice"
import { accountActions } from "./store/account/account.slice"
import { useDispatch } from "react-redux"
import { tokenActions } from "./store/tokens/token.slice"
import { PoolDashboard } from "./Components/PoolDashboard"
import { Account } from "./Components/Account"

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
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(providerActions.initializeRequest({}))
    dispatch(accountActions.initializeRequest({}))
    dispatch(tokenActions.initializeRequest({}))
  }, [])

  const [value, setValue] = useState(0)

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

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
          <Tab label="Account" {...a11yProps(0)} />
          <Tab label="Tokens" {...a11yProps(1)} />
          <Tab label="Liquidity Pools" {...a11yProps(2)} />
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
          <Account />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <Tokens />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          <PoolDashboard />
        </CustomTabPanel>
      </Box>
    </Box>
  )
}

export default App

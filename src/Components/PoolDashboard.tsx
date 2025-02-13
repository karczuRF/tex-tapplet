import { Box } from "@mui/material"
import { ExitPool } from "./ExitPool"
import { Swap } from "./Swap"
import { JoinPool } from "./JoinPool"

export const PoolDashboard = () => {
  return (
    <Box
      display="grid"
      gridTemplateColumns={"repeat(3, 1fr)"}
      gap={1}
      justifyContent="center"
      alignItems="center"
      height="100%"
      width="100%"
    >
      <JoinPool />
      <ExitPool />
      <Swap />
    </Box>
  )
}

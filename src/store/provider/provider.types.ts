import { TariUniverseProvider } from "@tari-project/tarijs"
import { TappletPermissions } from "../../types/tapplet"

export type ProviderStoreState = {
  isInitialized: boolean
  provider: TariUniverseProvider | null
  permissions: TappletPermissions
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type InitProviderRequestPayload = {}
export type InitProviderFailurePayload = {
  errorMsg: string
}
export type InitProviderSuccessPayload = {
  provider: TariUniverseProvider
}

export type UpdatePermissionsRequestPayload = {
  permissions: TappletPermissions
}
export type UpdatePermissionsSuccessPayload = {
  permissions: TappletPermissions
}
export type UpdatePermissionsFailurePayload = {
  errorMsg: string
}

import { TariPermission } from "@tari-project/tari-permissions"

export interface TappletPermissions {
  requiredPermissions: TariPermission[]
  optionalPermissions: TariPermission[]
}

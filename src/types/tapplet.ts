import { TariPermission } from "@tari-project/tarijs/dist/providers/tari_universe"

export interface TappletPermissions {
  requiredPermissions: TariPermission[]
  optionalPermissions: TariPermission[]
}

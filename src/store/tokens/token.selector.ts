import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../store"

const tokensStateSelector = (state: RootState) => state.tokens

const selectTokens = createSelector([tokensStateSelector], (state) => state.tokens)
const selectTex = createSelector([tokensStateSelector], (state) => state.texAddress)

export const tokensSelector = {
  selectTokens,
  selectTex,
}

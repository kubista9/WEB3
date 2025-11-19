import { createSlice, PayloadAction } from "@reduxjs/toolkit"

const notifSlice = createSlice({
  name: "notif",
  initialState: [] as string[],
  reducers: {
    push(state, action: PayloadAction<string>) {
      state.push(action.payload)
    }
  }
})

export const { push } = notifSlice.actions
export default notifSlice.reducer

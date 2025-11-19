export type ActionMessage = {
  type: 'PLAY' | 'DRAW' | 'SAY_UNO'
  payload?: any
}
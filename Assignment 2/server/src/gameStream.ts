import { Subject, scan } from 'rxjs'
import { createGame } from "../../model/src/uno"
import { draw, sayUno, play } from '../../model/src/round'
import { Game } from '../../model/src/interfaces'

export const actions$ = new Subject<{ type: string; payload?: any }>()
let initialGame: Game = createGame({ players: ['A', 'B', 'C'] })

export const game$ = actions$.pipe(
  scan((state: Game, action) => {
    switch (action.type) {
      case 'PLAY':
        try {
          return {
            ...state,
            currentRound: play(action.payload.index, action.payload.color, state.currentRound!)
          }
        } catch (err) {
          console.warn('Invalid play ignored:', (err as Error).message)
          return state
        }

      case 'DRAW':
        return { ...state, currentRound: draw(state.currentRound!) }
      case 'SAY_UNO':
        return { ...state, currentRound: sayUno(action.payload.player, state.currentRound!) }
      default:
        return state
    }
  }, initialGame)
)

export let currentState: Game = initialGame
game$.subscribe((newState) => {
  currentState = newState
})
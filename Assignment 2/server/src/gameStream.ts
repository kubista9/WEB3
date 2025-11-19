import { Subject, scan } from 'rxjs'
import { createGame } from '../../model/dist/model/uno'
import { draw, sayUno, play } from '../../model/dist/model/round'
import { Game } from '../../model/dist/model/interfaces'

// Subject that receives actions
export const actions$ = new Subject<{ type: string; payload?: any }>()

// Initial game state
let initialGame: Game = createGame({ players: ['A', 'B', 'C'] })

// Reactive state stream
export const game$ = actions$.pipe(
  scan((state: Game, action) => {
    console.log("Login requested from" + action.payload.username)
    console.log("Register requested from" + action.payload.username)
    switch (action.type) {
      case 'PLAY':
        try {
          return {
            ...state,
            currentRound: play(action.payload.index, action.payload.color, state.currentRound!)
          }
        } catch (err) {
          console.warn('⚠️ Invalid play ignored:', (err as Error).message)
          return state // keep game running
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

// Keep latest state for /state endpoint
export let currentState: Game = initialGame
game$.subscribe((newState) => {
  currentState = newState
  console.log('Updated State:', newState)
})
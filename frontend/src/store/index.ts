import { configureStore } from '@reduxjs/toolkit'
import {analyticsApi} from '../services/analytics'
import configurationReducer from './configurationSlice'
import priceCalculatorSlice from './priceCalculatorSlice'

export const store = configureStore({
  reducer: {
    configuration: configurationReducer,
    priceCalculator: priceCalculatorSlice,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(analyticsApi.middleware),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
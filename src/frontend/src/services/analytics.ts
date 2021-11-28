// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define a service using a base URL and expected endpoints
export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5000/api/v1/analytics' }),
  endpoints: (builder) => ({
    getPriceEvolution: builder.query({
      query: () => 'prices_evolution'	,
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetPriceEvolutionQuery } = analyticsApi
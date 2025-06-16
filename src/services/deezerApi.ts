import axios from 'axios'
import type { Theme, Song } from '../types'

// Try multiple CORS proxies as fallbacks
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
]

const BASE_URL = 'https://api.deezer.com'

// Create axios instance with timeout
const createApiInstance = (proxyUrl: string) => {
  return axios.create({
    baseURL: proxyUrl + BASE_URL,
    timeout: 15000,
  })
}

// Try API call with different proxies
async function tryApiCall<T>(endpoint: string, params: any = {}): Promise<T> {
  let lastError: any = null
  
  for (const proxy of CORS_PROXIES) {
    try {
      console.log(`Trying API call with proxy: ${proxy}`)
      const api = createApiInstance(proxy)
      const response = await api.get(endpoint, { params })
      console.log(`Success with proxy: ${proxy}`)
      return response.data
    } catch (error) {
      console.warn(`Failed with proxy ${proxy}:`, error)
      lastError = error
      continue
    }
  }
  
  // If all proxies fail, try direct call (might work in some environments)
  try {
    console.log('Trying direct API call...')
    const directApi = axios.create({
      baseURL: BASE_URL,
      timeout: 15000,
    })
    const response = await directApi.get(endpoint, { params })
    console.log('Success with direct call')
    return response.data
  } catch (error) {
    console.error('All API attempts failed:', error)
    throw lastError || error
  }
}

export async function searchPlaylists(query: string = 'popular'): Promise<Theme[]> {
  try {
    console.log(`Searching playlists for: "${query}"`)
    
    const data = await tryApiCall('/search/playlist', {
      q: query,
      limit: 25,
    })
    
    console.log('Search response:', data)
    
    // Filter out playlists with too few tracks
    const playlists = (data.data || []).filter((playlist: Theme) => 
      playlist.nb_tracks >= 10 && playlist.picture
    )
    
    console.log(`Found ${playlists.length} valid playlists`)
    return playlists
  } catch (error) {
    console.error('Error searching playlists:', error)
    
    // Return empty array instead of fallback playlists
    return []
  }
}

export async function getPlaylistTracks(playlistId: number): Promise<Song[]> {
  try {
    console.log(`Fetching tracks for playlist ${playlistId}`)
    
    const data = await tryApiCall(`/playlist/${playlistId}/tracks`, {
      limit: 100
    })
    
    // Filter tracks to ensure they have preview URLs and are valid
    const validTracks = (data.data || []).filter((track: Song) => {
      return track.preview && 
             track.preview !== '' && 
             track.title && 
             track.artist && 
             track.artist.name &&
             track.duration > 30
    })
    
    console.log(`Playlist ${playlistId}: Found ${validTracks.length} valid tracks out of ${data.data?.length || 0} total`)
    
    return validTracks
  } catch (error) {
    console.error(`Error fetching tracks for playlist ${playlistId}:`, error)
    return []
  }
}

export async function getPlaylistById(playlistId: number): Promise<Theme | null> {
  try {
    const data = await tryApiCall(`/playlist/${playlistId}`)
    return data
  } catch (error) {
    console.error(`Error fetching playlist ${playlistId}:`, error)
    return null
  }
}

export async function getChartPlaylists(): Promise<Theme[]> {
  try {
    console.log('Fetching chart playlists...')
    
    const data = await tryApiCall('/chart/0/playlists', {
      limit: 25
    })
    
    // Filter playlists to ensure they have enough tracks
    const playlists = (data.data || []).filter((playlist: Theme) => 
      playlist.nb_tracks >= 15 && playlist.picture
    )
    
    console.log(`Found ${playlists.length} chart playlists`)
    return playlists
  } catch (error) {
    console.error('Error fetching chart playlists:', error)
    
    // Return empty array instead of fallback playlists
    return []
  }
}

export default {
  searchPlaylists,
  getPlaylistTracks,
  getPlaylistById,
  getChartPlaylists,
}
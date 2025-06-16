export interface Theme {
  id: number
  title: string
  picture: string
  tracklist: string
  nb_tracks: number
}

export interface Artist {
  id: number
  name: string
  picture: string
}

export interface Album {
  id: number
  title: string
  cover: string
}

export interface Song {
  id: number
  title: string
  preview: string
  artist: Artist
  album: Album
  duration: number
}

export type AnswerMode = 'artist' | 'song' | 'both'

export interface GameSettings {
  maxPoints: number
  selectedThemeIds: number[]
  answerMode: AnswerMode
}

export interface GameResult {
  songId: number
  songTitle: string
  artistName: string
  userAnswer: string
  isCorrect: boolean
  score: number
  timeRemaining: number
}
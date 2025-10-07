export const getCurrentSeason = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  let seasonStartDate: string, seasonEndDate: string

  if (month >= 0 && month <=2) {
    seasonStartDate = `${year}-01-01`
    seasonEndDate = `${year}-03-31`
  } else if (month >= 3 && month <=5) {
    seasonStartDate = `${year}-04-01`
    seasonEndDate = `${year}-06-30`
  } else if (month >= 6 && month <=8) {
    seasonStartDate = `${year}-07-01`
    seasonEndDate = `${year}-09-30`
  } else {
    seasonStartDate = `${year}-10-01`
    seasonEndDate = `${year}-12-31`
  }
  return {seasonStartDate, seasonEndDate}
}

export const getPrevSeason = () => {
    const now = new Date()
    const month = now.getMonth()
    let year = now.getFullYear()
    let season: "winter" | "spring" | "summer" | "fall"

    if (month >= 0 && month <= 2) {
        season = "fall"
        year -= 1
    } else if (month >= 3 && month <=5) {
        season = "winter"
    } else if (month >= 6 && month <=8) {
        season = "spring"
    } else {
        season = "summer"
    }
    return {year, season}
}
export default async function handler(req, res) {
  const allowedStations = new Set([
    "41114", "41113", "41112", "41009", "41010",
    "42003", "42013", "42022", "42036", "42097", "42098",
    "VENF1", "LKWF1", "SMKF1", "MLRF1"
  ]);

  const station = String(req.query.station || "").trim().toUpperCase();

  if (!allowedStations.has(station)) {
    return res.status(400).json({
      error: "Invalid NOAA/NDBC station."
    });
  }

  const url = `https://www.ndbc.noaa.gov/data/realtime2/${station}.txt`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "FloridaBiteForecast/1.0",
        "Accept": "text/plain"
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: "NOAA/NDBC request failed.",
        station
      });
    }

    const text = await response.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=1800");
    res.setHeader("Content-Type", "text/plain; charset=utf-8");

    return res.status(200).send(text);
  } catch (error) {
    return res.status(500).json({
      error: "Unable to load NOAA/NDBC buoy data.",
      station
    });
  }
}

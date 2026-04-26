module.exports = async function handler(req, res) {
  const allowedStations = new Set([
    "41114", "41113", "41112", "41009", "41010",
    "42003", "42013", "42022", "42036", "42097", "42098",
    "VENF1", "LKWF1", "SMKF1", "MLRF1"
  ]);

  if (req.query.health === "1") {
    return res.status(200).json({
      ok: true,
      message: "Florida Bite Forecast NDBC API route is live."
    });
  }

  const station = String(req.query.station || "").trim().toUpperCase();

  if (!allowedStations.has(station)) {
    return res.status(400).json({
      ok: false,
      error: "Invalid NOAA/NDBC station.",
      station
    });
  }

  const url = `https://www.ndbc.noaa.gov/data/realtime2/${station}.txt`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "FloridaBiteForecast/1.0 (contact: reeldadoutdoors@gmail.com)",
        "Accept": "text/plain,*/*"
      }
    });

    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: "NOAA/NDBC request failed.",
        station,
        status: response.status,
        preview: text.slice(0, 300)
      });
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=1800");
    res.setHeader("Content-Type", "text/plain; charset=utf-8");

    return res.status(200).send(text);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: "Unable to load NOAA/NDBC buoy data.",
      station,
      detail: error.message
    });
  }
};

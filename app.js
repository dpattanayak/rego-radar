require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const path = require("path");
const fs = require("fs/promises");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

const apiEndpoint = process.env.API_ENDPOINT;
const apiSecret = process.env.API_SECRET;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine", "ejs");

const corsOptions = {
  origin: "http://192.168.29.44:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

const validateApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey && apiKey === process.env.X_API_Key) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/js/index.js", (req, res) => {
  res.sendFile(__dirname + "/js/index.min.js");
});

app.get("/result", (req, res) => {
  const resultData = {
    regn_no: decodeURIComponent(req.query.regn_no),
    regn_dt: decodeURIComponent(req.query.regn_dt),
    owner_name: decodeURIComponent(req.query.owner_name),
    f_name: decodeURIComponent(req.query.f_name),
    chasi_no: decodeURIComponent(req.query.chasi_no),
    c_add1: decodeURIComponent(req.query.c_add1),
    c_add2: decodeURIComponent(req.query.c_add2),
    c_add3: decodeURIComponent(req.query.c_add3),
    mobile_no: decodeURIComponent(req.query.mobile_no),
  };
  res.render("result", { resultData });
});

app.get("/error", (req, res) => {
  res.render("error", { errorMessage: "Error handling data request" });
});

app.post("/search", validateApiKey, async (req, res) => {
  const regn_no = req.body.regn_no.replace(/\s/g, "");
  const filePath = path.join(__dirname, "public", "results", `${regn_no}.json`);
  try {
    // Check if the file exists
    const fileExists = await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false);

    console.log("fileExists : ", fileExists);

    if (fileExists) {
      // Read the existing data from the file
      const fileData = await fs.readFile(filePath, "utf-8");
      let resultData = JSON.parse(fileData);
      resultData = {
        regn_no: resultData.regn_no,
        regn_dt: resultData.regn_dt,
        owner_name: resultData.owner_name,
        f_name: resultData.f_name,
        chasi_no: resultData.chasi_no,
        c_add1: resultData.c_add1,
        c_add2: resultData.c_add2,
        c_add3: resultData.c_add3,
        mobile_no: resultData.mobile_no,
      };
      // res.render("result", { resultData });
      res.json(resultData);
    } else {
      // If the file doesn't exist, make a new API request
      const apiResponse = await axios.post(
        apiEndpoint,
        {
          regn_no: regn_no,
          consent: "Y",
          consent_text:
            "I hear by declare my consent agreement for fetching my information via AITAN Labs API",
        },
        { headers: { Authorization: `Bearer ${apiSecret}` } }
      );

      // Extract relevant data from the API response
      const resultData = {
        regn_no: apiResponse.data.regn_no,
        regn_dt: apiResponse.data.regn_dt,
        owner_name: apiResponse.data.owner_name,
        f_name: apiResponse.data.f_name,
        chasi_no: apiResponse.data.chasi_no,
        c_add1: apiResponse.data.c_add1,
        c_add2: apiResponse.data.c_add2,
        c_add3: apiResponse.data.c_add3,
        mobile_no: apiResponse.data.mobile_no,
      };

      console.log("apiResponse : ", apiResponse);

      if (apiResponse.data.message === "success") {
        // await fs.writeFile(filePath, JSON.stringify(apiResponse.data, null, 2));

        // res.render("result", { resultData });
        res.json(resultData);
      } else {
        res.render("error", { errorMessage: "Error handling data request" });
      }
    }
  } catch (error) {
    res.render("error", { errorMessage: "Error handling data request" });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${port}`);
});

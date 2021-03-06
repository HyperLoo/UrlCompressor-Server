const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("cors");

const url = require("./routes/api/url");
const users = require("./routes/api/users");
const auth = require("./routes/api/auth");

const Url = require("./models/url");

const app = express();
app.use(cors());

app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.xssFilter());

app.use(helmet.dnsPrefetchControl({ allow: true }));
app.use(helmet.frameguard({ action: "sameorigin" }));
app.use(helmet.hidePoweredBy({ setTo: "your dummy tech" }));
app.use(helmet.hsts({ maxAge: 2592000 })); //30 days max age

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// require("dotenv").config();

mongoose
	.connect(
		`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-jwfcs.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
		}
	)
	.then(() => {
		console.log("MongoDb connected.....");
	})
	.catch((err) => {
		console.log("Cannot connect to db due to " + err);
	});

app.use("/api/urls", url);
app.use("/api/register", users);
app.use("/api/login", auth);

app.get("/:code", async (req, res) => {
	try {
		const url = await Url.findOne({ code: req.params.code });

		if (url) {
			if (
				url.lastDate &&
				url.lastDate.toISOString() < new Date().toISOString()
			) {
				const user = await User.findById(url.creator);

				for (let i = 0; i < user.shortenedUrl.length; i++) {
					if (user.shortenedUrl[i].toString() === id) {
						user.shortenedUrl.splice(i, 1);
						break;
					}
				}
				await user.save();
				await url.deleteOne();
				return res
					.status(404)
					.json({ msg: "This Compress URL does not exist any more!" });
			}
			if (!url.status) {
				return res
					.status(404)
					.json({ msg: "This url is temporarily out of service!" });
			}

			url.clicks = url.clicks + 1;
			url.save();
			return res.redirect(url.longUrl);
		} else {
			return res.status(404).json({ msg: "No Compressed URL Found" });
		}
	} catch (err) {
		console.log(err);
		res.status(500).json({ msg: "Internal Server Error" });
	}
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server Started on port ${port}`));

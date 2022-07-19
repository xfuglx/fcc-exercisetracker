const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
require("./utils/db");
const Tracker = require("./models/Tracker");

app
  .route("/api/users")
  .post(async (req, res) => {
    const dup = await Tracker.findOne({ username: req.body.username });
    if (dup) {
      const { username, _id } = dup;
      return res.json({
        username,
        _id,
      });
    } else {
      Tracker.create(
        {
          username: req.body.username,
          count: 0,
          log: [],
        },
        (err, result) => {
          if (err) {
            console.log("Error creating user data");
            return res.json({
              err: "Error creating user data",
            });
          }
          const { username, _id } = result;
          return res.json({
            username,
            _id,
          });
        }
      );
    }
  })
  .get(async (req, res) => {
    const trackers = [...(await Tracker.find({}))];
    const test = trackers.map((tracker) => {
      return {
        _id: tracker._id,
        username: tracker.username,
        __v: tracker.__v,
      };
    });
    res.json(test);
  });

app.post("/api/users/:_id/exercises", async (req, res) => {
  // console.log(`POST /api/users/${req.params._id}/exercises : ` + req.body.description, req.body.duration, req.body.date);
  try {
    const description = req.body.description;
    const duration = parseInt(req.body.duration);
    const date = typeof req.body.date === undefined || !req.body.date ? new Date().toDateString() : new Date(req.body.date).toDateString();
    console.log(`POST /api/users/${req.params._id}/exercises : `, { description, duration, date });
    Tracker.findOneAndUpdate(
      { _id: req.body[":_id"] || req.params._id },
      {
        $push: {
          log: [
            {
              description,
              duration,
              date,
            },
          ],
        },
        $inc: {
          count: 1,
        },
      },
      (err, doc) => {
        if (err) {
          console.log("error");
          return res.json({
            error: "Error",
          });
        } else {
          console.log(doc);
          return res.json({
            _id: doc._id,
            username: doc.username,
            date,
            duration,
            description,
          });
        }
      }
    );
  } catch {
    console.log("User not found");
    return res.json({
      error: "User not found",
    });
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  // createdAt:{$gte:ISODate("2021-01-01"),$lt:ISODate("2020-05-01"}
  console.log(`GET /api/users/${req.params._id}/logs`);
  const fromDate = req.query.from === undefined ? 0 : new Date(req.query.from).getTime();
  const toDate = req.query.to === undefined ? new Date().getTime() : new Date(req.query.to).getTime();
  const limit = parseInt(req.query.limit) || 0;
  let pointer = 0;
  console.log(limit);
  try {
    const { _id, username, count, log } = await Tracker.findOne({ _id: req.params._id });
    const newLog = log
      .map((l) => {
        return {
          description: l.description,
          duration: l.duration,
          date: l.date,
        };
      })
      .filter((l) => {
        if (new Date(l.date).getTime() <= toDate && new Date(l.date).getTime() >= fromDate) {
          console.log("Ada data");
          if (limit === 0) {
            console.log("Ada data?");
            return true;
          } else if (pointer < limit) {
            pointer++;
            return true;
          }
        }
        return false;
      });
    return res.json({ _id, username, count, log: newLog });
  } catch {
    console.log("Data not found");
    return res.json({
      error: "Data not found",
    });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

// =============================================

// const express = require("express");
// const app = express();
// const cors = require("cors");
// require("dotenv").config();

// app.use(cors());
// app.use(express.static("public"));
// app.get("/", (req, res) => {
//   res.sendFile(__dirname + "/views/index.html");
// });

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// require("./utils/db");
// const Tracker = require("./models/Tracker");

// app
//   .route("/api/users")
//   .post(async (req, res) => {
//     const dup = await Tracker.findOne({ username: req.body.username });
//     if (dup) {
//       const { username, _id } = dup;
//       console.log(`\nUser already registered`)
//       return res.json({
//         username,
//         _id,
//       });
//     } else {
//       Tracker.create(
//         {
//           username: req.body.username,
//           count: 0,
//           log: [],
//         },
//         (err, result) => {
//           if (err) {
//             console.log("Error creating user data");
//             return res.json({
//               err: "Error creating user data",
//             });
//           }
//           const { username, _id } = result;
//           console.log(`\nUser Created`)
//           return res.json({
//             username,
//             _id,
//           });
//         }
//       );
//     }
//   })
//   .get(async (req, res) => {
//     const trackers = [...(await Tracker.find({}))];
//     const test = trackers.map((tracker) => {
//       return {
//         _id: tracker._id,
//         username: tracker.username,
//         __v: tracker.__v,
//       };
//     });
//     res.json(test);
//   });

// app.post("/api/users/:_id/exercises", async (req, res) => {
//   console.log(`\nPOST /api/users/${req.params._id}/exercises : `)
//     // + req.body.description, req.body.duration, req.body.date);
//   // console.log(req.body)
//   try {
//     const check = await Tracker.findOne({ _id: req.body[":_id"] || req.params._id });
//     console.log(check)
//     try {
//       const description = req.body.description;
//       const duration = parseInt(req.body.duration);
//       const date = typeof req.body.date === undefined || !req.body.date ? new Date().toDateString() : new Date(req.body.date).toDateString();
//       console.log({_id: req.body[":_id"] || req.params._id,description,duration,date})
//       await check.updateOne({
//         $push: {
//           log: [
//             {
//               description,
//               duration,
//               date,
//             },
//           ],
//         },
//         $inc: {
//           count: 1,
//         },
//       });
//       console.log("Berhasil update data")
//       return res.json({
//         _id: check._id,
//         username: check.username,
//         date,
//         duration,
//         description,
//       });
//     } catch {
//       console.log("Error updating data");
//       return res.json({
//         error: "Error updating data",
//       });
//     }
//   } catch {
//     console.log("User not found");
//     return res.json({
//       error: "User not found",
//     });
//   }
//   // }
// });

// app.get("/api/users/:_id/logs", async (req, res) => {
//   console.log(`\nGET /api/users/${req.params._id}/logs`);
//   try {
//     const { _id, username, count, log } = await Tracker.findOne({ _id: req.params._id });
//     const newLog = log.map((l) => {
//       return {
//         description: l.description,
//         duration: l.duration,
//         date: l.date,
//       };
//     });
//     console.log("Berhasil mengambil data")
//     return res.json({ _id, username, count, log: newLog });
//     // const test = await Tracker.findOne({ _id: req.params._id });
//     // return res.json({ test });
//   } catch {
//     console.log("Data not found");
//     return res.json({
//       error: "Data not found",
//     });
//   }
// });

// const listener = app.listen(process.env.PORT || 3000, () => {
//   console.log("Your app is listening on port " + listener.address().port);
// });

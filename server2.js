const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  session({ secret: "your_secret_key", resave: true, saveUninitialized: true })
);

// Database connection
mongoose.connect("mongodb://localhost:27017/myapp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

// User schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});
const User = mongoose.model("User", userSchema);

// Student schema
const studentSchema = new mongoose.Schema({
  studentName: String,
  registerNo: Number,
  department: String,
  email: String,
  phoneNo: Number,
  gender: String,
  dob: Date,
  bloodGroup: String,
  caste: String,
  religion: String,
  community: String,
  nationality: String,
  firstGraduate: String,
  aadharNo: Number,
});

// Student model
const Student = mongoose.model("Student", studentSchema);

// Residential schema
const residentialSchema = new mongoose.Schema({
  doorNo: String,
  streetName: String,
  villageName: String,
  city: String,
  pinCode: Number,
  state: String,
  country: String,
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
});

// Residential model
const Residential = mongoose.model("Residential", residentialSchema);

//family Schema

const familySchema = new mongoose.Schema({
  fatherName: String,
  fatherOccupation: String,
  motherName: String,
  motherOccupation: String,
  guardianName: String,
  orphanCategory: String,
  mobileNumber: String,
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
});

//Family model
const Familyinfo = mongoose.model("Familyinfo", familySchema);

//Academic schema
const academicInfoSchema = new mongoose.Schema({
  academicYear: String,
  courseType: String,
  course: String,
  branch: String,
  admissionDate: Date,
  admissionNumber: String,
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
});

//Academic model
const AcademicInfo = mongoose.model("AcademicInfo", academicInfoSchema);

//CGPA schema
const cgpaSchema = new mongoose.Schema({
  semester1: Number,
  semester2: Number,
  semester3: Number,
  semester4: Number,
  semester5: Number,
  semester6: Number,
  semester7: Number,
  semester8: Number,
  overallCGPA: Number,
  marksPercentage: Number,
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
});

//CGPA model
const CgpaInfo = mongoose.model("CgpaInfo", cgpaSchema);

// Routes
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/home.html");
});

app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/public/signup.html");
});

app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (user) {
      return res.status(400).send("Email already exists");
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    res.redirect("/login.html");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });

    if (!user || user.password !== password) {
      return res.status(401).send("Invalid email or password");
    }

    req.session.user = user;
    res.redirect("/general.html");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

function requireLogin(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect("/login.html");
}

app.get("/general.html", requireLogin, (req, res) => {
  res.sendFile(__dirname + "/public/general.html");
});

// Handle POST request for student informations

// app.post("/general_sign_up", async (req, res) => {
//   const studentData = req.body;
//   studentData.studentId = req.session.studentId;
//   const newStudent = new Student(studentData);

//   try {
//     await newStudent.save();
//     console.log("Student Record Inserted Successfully");
//     return res.redirect("/residential.html"); // Redirect to the residential information form
//   } catch (err) {
//     console.error("Error saving student data to database:", err);
//     return res.status(500).send("Error saving student data to database");
//   }
// });

app.post("/general_sign_up", async (req, res) => {
  const studentData = req.body;
  studentData.studentId = req.session.studentId;
  const newStudent = new Student(studentData);

  try {
    await newStudent.save();
    console.log("Student Record Inserted Successfully");
    return res.redirect("/residential.html"); // Redirect to the residential information form
  } catch (err) {
    console.error("Error saving student data to database:", err);
    return res.status(500).send("Error saving student data to database");
  }
});

// Add a route for the login page
// app.get("/login.html", (req, res) => {
//   res.sendFile(__dirname + "/login.html");
// });

// Handle POST request for residential information
app.post("/residential_sign_up", async (req, res) => {
  const residentialData = req.body;
  residentialData.studentId = req.session.studentId; // Retrieve student ID from session
  const newResidential = new Residential(residentialData);

  try {
    await newResidential.save();
    console.log("Residential Record Inserted Successfully");
    return res.redirect("/familyinfo.html"); // Redirect to the next step
  } catch (err) {
    console.error("Error saving residential data to database:", err);
    return res.status(500).send("Error saving residential data to database");
  }
});



app.post("/familyinfo_sign_up", async (req, res) => {
  const familyData = req.body;
  familyData.studentId = req.session.studentId; // Retrieve student ID from session
  const newFamilyinfo = new Familyinfo(familyData);

  try {
    await newFamilyinfo.save();
    console.log("family Record Inserted Successfully");
    return res.redirect("/academic-info.html"); // Redirect to the next step
  } catch (err) {
    console.error("Error saving residential data to database:", err);
    return res.status(500).send("Error saving residential data to database");
  }
});


app.post("/academicinfo_sign_up", async (req, res) => {
  const academicData = req.body;
  academicData.studentId = req.session.studentId; // Retrieve student ID from session
  const newAcademicInfo = new AcademicInfo(academicData);

  try {
    await newAcademicInfo.save();
    console.log("Academic Record Inserted Successfully");
    return res.redirect("/cgpa-calculation.html"); // Redirect to the next step
  } catch (err) {
    console.error("Error saving residential data to database:", err);
    return res.status(500).send("Error saving residential data to database");
  }
});

app.post("/cgpainfo_sign_up", async (req, res) => {
  const cgpaData = req.body;
  cgpaData.studentId = req.session.studentId;

  // Calculate overall CGPA and marks percentage
  const semesterGrades = Object.values(cgpaData).slice(0, 8); // Extract semester grades
  const totalCGPA =
    semesterGrades.reduce((acc, grade) => acc + parseFloat(grade), 0) / 8;
  const marksPercentage = (totalCGPA / 10) * 100;

  // Assign calculated values to the data object
  cgpaData.overallCGPA = totalCGPA.toFixed(2);
  cgpaData.marksPercentage = marksPercentage.toFixed(2);

  try {
    // Save CGPA data to the database
    const newCgpaInfo = new CgpaInfo(cgpaData);
    await newCgpaInfo.save();
    console.log("CGPA Record Inserted Successfully");
    return res.redirect("/temp.html"); // Redirect to the next step
  } catch (err) {
    console.error("Error saving CGPA data to database:", err);
    return res.status(500).send("Error saving CGPA data to database");
  }
});
app.get("/")

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

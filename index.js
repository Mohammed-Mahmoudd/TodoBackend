const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const env = require("dotenv").config();
const jwt = require("jsonwebtoken");
const authMiddleWare = require("./middleware/auth");

const app = express();

app.use(express.json());

const Users = require("./models/Users");
const Categories = require("./models/Category");
const Tasks = require("./models/Task");

mongoose
  .connect(
    "mongodb+srv://mohammed:aEvGKeuICi320WNP@todocluster.n2iufgs.mongodb.net/?retryWrites=true&w=majority&appName=TodoCluster"
  )
  .then(() => {
    console.log("Monogoose is Opened Successfully");
    app.listen("3001", () => {
      console.log("Port Is Opened Successfully");
    });
  })
  .catch((error) => {
    console.log("Error while connecting with mongoose: " + error);
  });

app.get("/start", (req, res) => {
  res.send("start");
});

// ==  Auth EndPoints  == //

// == Register New User == //
app.post("/registerNewUser", async (req, res) => {
  const newUser = new Users();
  const nameFromClient = req.body.name;
  const emailFromCLient = req.body.email;
  const passwordFromClient = req.body.password;

  const userExist = await Users.findOne({ email: emailFromCLient });
  if (userExist) {
    res.json({
      message: `This ${emailFromCLient} Email Is Used Before`,
    });
    return;
  } else {
    const hashedPassword = await bcrypt.hash(passwordFromClient, 10);

    newUser.name = nameFromClient;
    newUser.email = emailFromCLient;
    newUser.password = hashedPassword;

    newUser
      .save()
      .then(() => {
        res.json({
          message: `Account ${newUser.name} Created Successfully`,
          name: newUser.name,
          email: newUser.email,
        });
      })
      .catch((error) => {
        res.json({
          message: "Error While Creating Your Account",
          error: error,
        });
      });
  }
});

// ==  Login  == //
app.post("/Login", async (req, res) => {
  const clientEmail = req.body.email;

  const user = await Users.findOne({ email: clientEmail });
  if (user) {
    const compareResult = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (compareResult) {
      const payload = {
        userId: user.id,
        email: clientEmail,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "72h",
      });

      res.json({
        message: "Login Successfully",
        token: token,
        userId: user.id,
        email: clientEmail,
      });
    } else {
      res.json({
        message: "Invalid password",
      });
    }
  } else {
    res.json({
      message: "Enter a Valid Email",
      email: clientEmail,
    });
  }
});

// ==  Categories EndPoints  == //

// ==  Create New Category  == //
app.post("/newCategory", authMiddleWare, async (req, res) => {
  const user = req.user;
  const categoryName = req.body.categoryName;
  const userId = user.userId;
  const taskNumber = 1;
  const icon = req.body.icon;

  const Category = new Categories();

  Category.categoryName = categoryName;
  Category.userId = userId;
  Category.taskNumber = taskNumber;
  Category.icon = icon;

  const CategoryExist = await Categories.findOne({
    categoryName: Category.categoryName,
  });

  if (CategoryExist) {
    res.json({
      message: `(${Category.categoryName}) is already exist`,
    });
    return;
  } else {
    try {
      await Category.save();
      res.json({
        message: "Category Added Successfully",
        categoryUserId: Category.userId,
        taskNumber: Category.taskNumber,
      });
    } catch (error) {
      res.json({
        message: "Error While Adding New Category",
        error: error,
      });
    }
  }
});

// ==  Get All Categories for specific user  == //
app.get("/getUserCategories", authMiddleWare, async (req, res) => {
  const user = req.user;
  const id = user.userId;

  const allCategories = await Categories.find({ userId: id });
  res.json(allCategories);
  console.log(allCategories);
});

// ==  Update Specific Category for specific user  == //
app.put("/updateCategory", authMiddleWare, async (req, res) => {
  const user = req.user;
  const id = user.userId;

  const categoryId = req.body.categoryId;
  const newCategoryName = req.body.newCategoryName;

  try {
    const UpdatedCategory = await Categories.findByIdAndUpdate(
      categoryId,
      { categoryName: newCategoryName, userId: id },
      { new: true }
    );

    if (!UpdatedCategory) {
      return res.json({
        message: "Category Not Found or Name Incorrect",
      });
    }

    res.json({
      message: "Category Name Updated Successfully",
      UpdatedCategory: UpdatedCategory,
    });
  } catch (error) {
    res.json({
      message: "Error While Updating Category Name",
      error: error,
    });
  }
});

// ==  Delete Specific Category for specific user  == //
app.delete("/deleteCategory", authMiddleWare, async (req, res) => {
  const user = req.user;
  const id = user.userId;

  const categoryId = req.body.categoryId;

  try {
    const DeleteCategory = await Categories.findOneAndDelete({
      _id: categoryId,
      userId: id,
    });
    res.json({
      message: "Category Name Deleted Successfully",
      DeleteCategory: DeleteCategory,
    });
  } catch (error) {
    res.json({
      message: "Error While Deleting Category Name",
      error: error,
    });
  }
});

// ==  Tasks Endpoints  == //

// ==  Add New Task  ==//
app.post("/addTask", authMiddleWare, async (req, res) => {
  const id = req.user.userId;
  const taskTitle = req.body.taskTitle;
  const taskDescription = req.body.taskDescription;
  const taskDate = req.body.taskDate;
  const status = req.body.status;
  const categoryId = req.body.categoryId;

  const Task = new Tasks({
    userId: id,
    taskTitle: taskTitle,
    taskDescription: taskDescription,
    taskDate: taskDate,
    status: status,
    categoryId: categoryId,
  });

  try {
    await Task.save();
    res.json({
      message: "Task Added Successfully",
      task: Task,
    });
  } catch (error) {
    res.json({
      message: "Error While Add New Task",
      error: error,
    });
  }
});

// ==  Get Tasks For Specific Category and Specific User  == //
app.post("/getTasks", authMiddleWare, async (req, res) => {
  const id = req.user.userId;
  const categoryId = req.body.categoryId;
  try {
    const tasks = await Tasks.find({
      userId: id,
      categoryId: categoryId,
    });
    res.json(tasks);
  } catch (error) {
    res.json({
      message: "Error While get your tasks",
      error: error,
    });
  }
});

app.get("/getAllTasks", authMiddleWare, async (req, res) => {
  const id = req.user.userId;
  try {
    const allTasks = await Tasks.find({ userId: id });
    res.json(allTasks);
  } catch (error) {
    res.json({
      message: "error while getting all tasks",
      error: error,
    });
  }
});

// ==  Update Specific Task  == //
app.put("/updateTask", authMiddleWare, async (req, res) => {
  const id = req.user.userId;

  const taskId = req.body.taskId;
  const newTitle = req.body.newTitle;
  const newDescription = req.body.newDescription;
  const newDate = req.body.newDate;
  const newStatus = req.body.newStatus;
  try {
    const updatedTask = await Tasks.findByIdAndUpdate(
      taskId,
      {
        taskTitle: newTitle,
        taskDate: newDate,
        taskDescription: newDescription,
        status: newStatus,
      },
      { new: true }
    );

    res.json({
      UpdatedTask: updatedTask,
      message: "Task Edited Successfully",
    });
  } catch (error) {
    res.json({
      message: "Error While Editing Task",
      error: error,
    });
  }
});

// ==  Delete Specific Task  == //
app.delete("/deleteTask", authMiddleWare, async (req, res) => {
  const taskId = req.body.taskId;

  try {
    const updatedTask = await Tasks.findByIdAndDelete(taskId);

    res.json({
      message: "Task Deleted Successfully",
      deletedTask: updatedTask,
    });
  } catch (error) {
    res.json({
      message: "Error While Deleting Task",
      error: error,
    });
  }
  ب;
});

const { Router } = require("express");
const userModel = require("../models/user.model");
const { upload, deleteFromCloudinary } = require("../config/clodinary.config");

const userRouter = Router();

userRouter.get('/', async (req, res) => {
    const users = await userModel.find().sort({ _id: -1 });
    res.status(200).json(users);
});

userRouter.put('/', upload.single('avatar'), async (req, res) => {
    const id = req.userId;
    const { email, fullName } = req.body;
    const filePath = req.file?.path;
    const user = await userModel.findById(id);

    console.log(user, "user");
    console.log(req.file);

    if (filePath) {
        const deleteId = user.avatar?.split('uploads/')[1];
        const id = deleteId?.split('.')[0];
        if (id) {
            console.log(deleteId, "deleteId");
            console.log(id, "id");
            await deleteFromCloudinary(`uploads/${id}`);
        }
    }

    await userModel.findByIdAndUpdate(id, {
        ...(email && { email }),
        ...(fullName && { fullName }),
        ...(filePath && { avatar: filePath })
    });

    res.status(200).json({ message: "user updated successfully" });
});

module.exports = userRouter;

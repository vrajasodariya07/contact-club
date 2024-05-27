import express from 'express';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';


import { getToken, isAuth, isAdmin } from '../utill.js';

const router = express.Router();

router.get('/enum-values', (req, res) => {
  try {
    const genderEnum = User.schema.path('gender').enumValues;
    const maritalStatusEnum = User.schema.path('maritalStatus').enumValues;
    const communityEnum = User.schema.path('community').enumValues;

    res.send({
      gender: genderEnum,
      maritalStatus: maritalStatusEnum,
      community: ['Surat', 'Mumbai', 'Vapi', 'Vadodara', 'Ahmedabad', 'Rajkot', 'Amreli', 'Other'],
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get('/',isAuth, async (req, res) => {
  try {
    const userlist = await User.find().select('-password -isAdmin');
    const loggedInUser = await User.findById(req.user._id).select('-password');

    if (userlist) {

      const userListDataWithLoggedInUser = {
        userList: userlist,
        loggedInUser:loggedInUser
      };
      
      res.send(userListDataWithLoggedInUser);
      return;
    }
    res.status(401).send({ message: 'Invalid Email or Password.' });
  } catch (error) {
    console.log(error);
  }

});

router.post('/signin', async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    // Check for user by email or phone number without checking isActive
    const signinUser = await User.findOne({phoneNumber 
    });

    // If user is not found
    if (!signinUser) {
      return res.status(401).send({ message: 'Invalid Email/Phone Number or Password.' });
    }
    // If user is found but is not active
    if (!signinUser.isActive) {
      return res.status(401).send({ message: 'Your account is not active yet. Once your ID is approved, you will be able to log in.' });
    }

    // Check password validity
    const isPasswordValid = bcrypt.compareSync(password, signinUser.password);

    if (isPasswordValid) {
      console.log("yes");

      res.send({
        _id: signinUser.id,
        givenName: signinUser.givenName,
        middleName: signinUser.middleName,
        lastName: signinUser.lastName,
        email: signinUser.email,
        phoneNumber: signinUser.phoneNumber,
        token: getToken(signinUser)
      });
    } else if (password === signinUser.password) {
      // For old plaintext passwords, rehash and update
      console.log("Rehashing old plaintext password");
      signinUser.password = bcrypt.hashSync(password, 8);
      const updatedUser = await signinUser.save();

      res.send({
        _id: updatedUser.id,
        givenName: updatedUser.givenName,
        middleName: updatedUser.middleName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        token: getToken(updatedUser),
      });
    } else {
      res.status(401).send({ message: 'Invalid Email/Phone Number or Password.' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});



router.post('/signup', async (req, res) => {
  console.log("signip");
try {
  const { givenName, middleName, lastName, community, city, native, gender, maritalStatus, birthDate, email, phoneNumber, occupation, password } = req.body;

  const findUser =  await User.findOne({ email });

  if (findUser) {
    return res.status(401).send({ message: 'Phonenumber already exists' });
  }

  const user = new User({
    givenName,
    middleName,
    lastName,
    community,
    city,
    native,
    gender,
    maritalStatus,
    birthDate,
    email,
    phoneNumber,
    occupation,
    password,
    CreatedAt: Date.now(),
    UpdatedAt: Date.now(),
    isAdmin: false

  });

  const newUser = await user.save();

  if (newUser) {
    res.send({
      _id: newUser.id,
      givenName: newUser.givenName,
      middleName: newUser.middleName,
      lastName: newUser.lastName,
      community: newUser.community,
      city: newUser.city,
      native: newUser.native,
      gender: newUser.gender,
      maritalStatus: newUser.maritalStatus,
      birthDate: newUser.birthDate,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
      occupation: newUser.occupation,
      CreatedAt: newUser.CreatedAt,
      UpdatedAt: newUser.UpdatedAt,
      isAdmin: false,
      isActive:false,
      isPrime:false
    });
  } else {
    res.status(401).send({ message: 'Invalid User Data.' });
  }
} catch (error) {
  res.status(401).send({ message: error.message });
  console.log(error);
}
});



router.put('/updateuser',isAuth, async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;
   
    // Find the user by email or phone number
    const user = await User.findOne({
      $or: [{ email }, { phoneNumber }]
    });

    if (user) {
      // Update fields if new values are provided, otherwise keep existing values
      user.givenName =  user.isAdmin? req.body.givenName || user.givenName : user.givenName;
      user.middleName = user.isAdmin? req.body.middleName || user.middleName: user.middleName;
      user.lastName = user.isAdmin? req.body.lastName || user.lastName:user.lastName;
      user.community = req.body.community || user.community;
      user.currentcity = req.body.currentcity || user.currentcity;
      user.native = user.isAdmin? req.body.native || user.native:user.native;
      user.gender = user.isAdmin? req.body.gender || user.gender:user.gender;
      user.maritalStatus =  req.body.maritalStatus || user.maritalStatus ;
      user.birthDate = user.isAdmin?req.body.birthDate || user.birthDate:user.birthDate;
      user.email = user.isAdmin?req.body.email || user.email:user.email;
      user.phoneNumber = user.isAdmin?req.body.phoneNumber || user.phoneNumber:user.phoneNumber;
      user.occupation = req.body.occupation || user.occupation;
      user.password = req.body.password ? bcrypt.hashSync(req.body.password, 8) : user.password; // Rehash password if provided
      user.isAdmin = user.isAdmin? true: false;
      user.isActive =user.isAdmin? req.body.isActive !== undefined ? req.body.isActive : user.isActive :user.isActive;
      user.isPrime = user.isAdmin? req.body.isPrime !== undefined ? req.body.isPrime : user.isPrime:user.isPrime;
      user.UpdatedAt = Date.now(); // Update the UpdatedAt timestamp
      user.CreatedAt = user.CreatedAt ? user.CreatedAt :Date.now(); // Update the created time timestamp
      
  
      const updatedUser = await user.save();

      res.send({
        _id: updatedUser._id,
        givenName: updatedUser.givenName,
        middleName: updatedUser.middleName,
        lastName: updatedUser.lastName,
        community: updatedUser.community,
        currentcity: updatedUser.currentcity,
        native: updatedUser.native,
        gender: updatedUser.gender,
        maritalStatus: updatedUser.maritalStatus,
        birthDate: updatedUser.birthDate,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        occupation: updatedUser.occupation,
        isAdmin: updatedUser.isAdmin,
        isActive: updatedUser.isActive,
        isPrime: updatedUser.isPrime,
        CreatedAt: updatedUser.CreatedAt,
        UpdatedAt: updatedUser.UpdatedAt,
      });

      return;
    } else {
      res.status(404).send({ message: 'User not found.' });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});


router.delete('/:id',
  async (req, res) => {
    const user = await Client.findById(req.params.id);
    if (user) {
      
      const deleteUser = await user.remove();
      res.send(deleteUser);
    } else {
      res.status(404).send({ message: 'User Not Found' });
    }
  }
);


// router.put('/:id', isAuth, isAdmin,
//   async (req, res) => {
//     const user = await User.findById(req.params.id);
//     if (user) {
//       user.firstName= req.body.firstName || user.firstName,
//       user.lastName= req.body.lastName || user.lastName,
//       user.email = req.body.email || user.email;
//       user.isAdmin = Boolean(req.body.isAdmin);
//       user.CreatedAt = Date.now();
//       const updatedUser = await user.save();
//       res.send({ message: 'User Updated', user: updatedUser });
//     } else {
//       res.status(404).send({ message: 'User Not Found' });
//     }
//   }
// );

// all the data
// User.updateMany({}, { $set: { 'CreatedAt': Date.now(), 'UpdatedAt': Date.now()} }, { upsert: false })
// .then((result) => {
//   console.log("Updated", result.modifiedCount, "documents.");
// })
// .catch((error) => {
//   console.error("Error updating documents:", error);
// });




export default router;
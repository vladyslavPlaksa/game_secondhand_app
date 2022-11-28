import React, { useEffect, useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { auth, colRefUserInfo, storage } from "../api/firebase";
import * as ROUTES from "../constants/routes";
import { addDoc } from "firebase/firestore";

const SignUp = ({ navigate }) => {
  const [imageUpload, setImageUpload] = useState(null);
  const [imageUrl, setImageUrl] = useState();
  const [userName, setUserName] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(null);

  useEffect(() => {
    console.log("use effect: ", imageUrl, userName);

    if (imageUrl != undefined && userName != null) {
      updateProfile(auth.currentUser, {
        displayName: userName,
        photoURL: imageUrl,
      }).then(() => {
        addDoc(colRefUserInfo, {
          uid: auth.currentUser.uid,
          phoneNumber: `+48${phoneNumber}`,
        }).then(() => {
          console.warn("Data was updated");
          navigate(ROUTES.HOMEPAGE);
        });
      });
    }
  }, [imageUrl, userName]);

  const signUpUser = (form) => {
    form.preventDefault();

    setUserName(form.target.userName.value);
    setPhoneNumber(form.target.phoneNumber.value);

    const email = form.target.login.value;
    const password = form.target.password.value;

    if (password == form.target.repeatPassword.value) {
      createUserWithEmailAndPassword(auth, email, password)
        .then((cred) => {
          console.log("Create user: ", cred);
          form.target.reset();

          if (imageUpload !== null) {
            const imageRef = ref(storage, `${cred.user.uid}/user-photo`);
            uploadBytes(imageRef, imageUpload).then((snapshot) => {
              getDownloadURL(snapshot.ref).then((url) => {
                setImageUrl(url);
                console.log("Upload img: ", url);
              });
            });
          } else {
            console.warn("User didn't uploaded profile photo");
            setImageUrl(null);
          }
        })
        .catch((err) => {
          console.error(err.message);
        });
    } else {
      alert("Password must be equal");
    }
  };
  return (
    <div className='flex justify-center items-center flex-col h-[75vh]'>
      <div className='bg-gray-300 p-5 rounded max-w-[400px] mx-[5%]'>
        <form onSubmit={signUpUser} className='flex justify-center items-center flex-col'>
          <input
            type='text'
            name='login'
            id='login'
            placeholder='Login'
            autoComplete='email'
            className='border-solid border-black border-2 rounded px-5 py-2 mb-4 w-full'
            required
          />
          <input
            type='password'
            name='password'
            id='password'
            placeholder='Hałso'
            autoComplete='new-password'
            className='border-solid border-black border-2 rounded px-5 py-2 mb-4 w-full'
            required
          />
          <input
            type='password'
            name='repeatPassword'
            id='repeatPassword'
            placeholder='Powtórz Hasło'
            autoComplete='new-password'
            className='border-solid border-black border-2 rounded px-5 py-2 mb-4 w-full'
            required
          />
          <input
            type='text'
            name='userName'
            id='userName'
            placeholder='Imienie'
            className='border-solid border-black border-2 rounded px-5 py-2 mb-4 w-full'
            required
          />
          <input
            type='text'
            maxLength={9}
            name='phoneNumber'
            id='phoneNumber'
            placeholder='Numer telefonu'
            className='border-solid border-black border-2 rounded px-5 py-2 mb-4 w-full'
            required
          />
          <input
            className='w-[85%]'
            type='file'
            name='userPhoto'
            id='userPhoto'
            accept='image/*'
            onChange={(event) => {
              setImageUpload(event.target.files[0]);
            }}
          />
          <input
            type='submit'
            value='Submit'
            className='bg-gray-50 hover:bg-gray-400 rounded px-5 py-2 mt-4 cursor-pointer w-[85%]'
          />
        </form>
      </div>
    </div>
  );
};

export default SignUp;
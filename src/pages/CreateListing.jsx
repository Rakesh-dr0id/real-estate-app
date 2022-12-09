import React, { useState } from 'react';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { v4 as uuid } from 'uuid';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './../Firebase';
import { useNavigate } from 'react-router-dom';

const CreateListing = () => {
  const [geolocationEnabled, setGeolocationEnabled] = useState(true);
  const auth = getAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: 'rent',
    name: '',
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: '',
    description: '',
    offer: true,
    regularPrice: 0,
    discountedPrice: 0,
    latitude: 0,
    longitude: 0,
    images: {},
  });

  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    description,
    offer,
    regularPrice,
    discountedPrice,
    latitude,
    longitude,
    images,
  } = formData;

  const onChangeHandler = (e) => {
    let boolean = null;
    if (e.target.value === 'true') {
      boolean = true;
    }
    if (e.target.value === 'false') {
      boolean = false;
    }

    //* Files
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files,
      }));
    }

    // *Text/Boolean/Number
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (discountedPrice >= regularPrice) {
      setLoading(false);
      toast.error('Discounted price needs to be less than regular price');
      return;
    }

    if (images.length > 6) {
      setLoading(false);
      toast.error('maximum 6 images are allowed');
      return;
    }

    let geolocation = {};
    // let location;
    //   if (geolocationEnabled) {
    //     const response = await fetch(
    //       `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.GEOCODE_API_KEY}`
    //     );

    //     const data = await response.json();
    //     console.log(data);
    //   }

    if (geolocationEnabled) {
      geolocation.lat = parseFloat(latitude);
      geolocation.lng = parseFloat(longitude);
    }

    const storeImage = async (image) => {
      return new Promise((res, rej) => {
        const storage = getStorage();
        const filename = `${auth.currentUser.uid}-${image.name}-${uuid()}`;
        const storageRef = ref(storage, filename);

        const uploadTask = uploadBytesResumable(storageRef, image);

        // Copied from firebase docs
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused');
                break;
              case 'running':
                console.log('Upload is running');
                break;
            }
          },
          (error) => {
            // Handle unsuccessful uploads
            rej(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              res(downloadURL);
            });
          }
        );
      });
    };

    const imgUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch((err) => {
      setLoading(false);
      toast.error('Images not uploaded ');
      console.log(err);
      return;
    });

    const formDataCopy = {
      ...formData,
      imgUrls,
      geolocation,
      timestamp: serverTimestamp(),
      userRef: auth.currentUser.uid,
    };

    delete formDataCopy.images;
    !formDataCopy.offer && delete formDataCopy.discountedPrice;
    delete formDataCopy.latitude;
    delete formDataCopy.longitude;

    const docRef = await addDoc(collection(db, 'listings'), formDataCopy);
    setLoading(false);
    toast.success('Listing created');
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <main className="max-w-md px-2 mx-auto">
      <h1 className="text-3xl text-center mt-6 font-bold ">Create a Listing</h1>
      <form onSubmit={onSubmit}>
        <p className="text-lg mt-6 font-semibold">Sell / Rent</p>

        <div className="flex justify-center items-center">
          <button
            type="button"
            id="type"
            value="sell"
            onClick={onChangeHandler}
            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              type === 'rent'
                ? 'bg-white text-black'
                : 'bg-slate-600 text-white'
            } `}
          >
            sell
          </button>

          <button
            type="button"
            id="type"
            value="rent"
            onClick={onChangeHandler}
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              type === 'sell'
                ? 'bg-white text-black'
                : 'bg-slate-600 text-white'
            } `}
          >
            rent
          </button>
        </div>

        {/* Name  */}
        <p className="text-lg mt-6 font-semibold ">Name</p>
        <input
          type="text"
          id="name"
          value={name}
          onChange={onChangeHandler}
          placeholder="Name"
          maxLength="50"
          minLength="10"
          required
          className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-800 focus:bg-white focus:border-slate-600 mb-6 "
        />

        {/* Beds & Baths */}
        <div className="flex space-x-6  mb-6">
          <div>
            <p className="text-lg font-semibold ">Beds</p>
            <input
              type="number"
              id="bedrooms"
              value={bedrooms}
              onChange={onChangeHandler}
              min="1"
              max="50"
              required
              className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
            />
          </div>

          <div>
            <p className="text-lg font-semibold ">Baths</p>
            <input
              type="number"
              id="bathrooms"
              value={bathrooms}
              onChange={onChangeHandler}
              min="1"
              max="50"
              required
              className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
            />
          </div>
        </div>

        {/* PARKING SPOT */}
        <p className="text-lg mt-6 font-semibold">Parking spot</p>

        <div className="flex justify-center items-center">
          <button
            type="button"
            id="parking"
            value={true}
            onClick={onChangeHandler}
            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              !parking ? 'bg-white text-black' : 'bg-slate-600 text-white'
            } `}
          >
            yes
          </button>

          <button
            type="button"
            id="parking"
            value={false}
            onClick={onChangeHandler}
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              parking ? 'bg-white text-black' : 'bg-slate-600 text-white'
            } `}
          >
            no
          </button>
        </div>

        {/* Furnished */}
        <p className="text-lg mt-6 font-semibold">Furnished</p>

        <div className="flex justify-center items-center">
          <button
            type="button"
            id="furnished"
            value={true}
            onClick={onChangeHandler}
            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              !furnished ? 'bg-white text-black' : 'bg-slate-600 text-white'
            } `}
          >
            yes
          </button>

          <button
            type="button"
            id="furnished"
            value={false}
            onClick={onChangeHandler}
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              furnished ? 'bg-white text-black' : 'bg-slate-600 text-white'
            } `}
          >
            no
          </button>
        </div>

        {/* Address */}
        <p className="text-lg mt-6 font-semibold ">Address</p>
        <textarea
          type="text"
          id="address"
          value={address}
          onChange={onChangeHandler}
          placeholder="Address"
          required
          className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-800 focus:bg-white focus:border-slate-600 mb-6 "
        />

        {/* Geolocation */}
        {geolocationEnabled && (
          <div className="flex space-x-6 justify-start mb-6">
            <div>
              <p className="text-lg font-semibold ">Latitude</p>
              <input
                type="string"
                id="latitude"
                value={latitude}
                onChange={onChangeHandler}
                required
                min="-90"
                max="90"
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:text-gray-700 focus:border-slate-600 text-center "
              />
            </div>

            <div>
              <p className="text-lg font-semibold ">Longitude</p>
              <input
                type="string"
                id="longitude"
                value={longitude}
                onChange={onChangeHandler}
                required
                min="-180"
                max="180"
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:text-gray-700 focus:border-slate-600 text-center "
              />
            </div>
          </div>
        )}

        {/* Description */}
        <p className="text-lg font-semibold ">Description</p>
        <textarea
          type="text"
          id="description"
          value={description}
          onChange={onChangeHandler}
          placeholder="Description"
          required
          className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-800 focus:bg-white focus:border-slate-600 mb-6 "
        />

        {/* Offer */}
        <p className="text-lg font-semibold">Offer</p>

        <div className="flex justify-center items-center">
          <button
            type="button"
            id="offer"
            value={true}
            onClick={onChangeHandler}
            className={`mr-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              !offer ? 'bg-white text-black' : 'bg-slate-600 text-white'
            } `}
          >
            yes
          </button>
          <button
            type="button"
            id="offer"
            value={false}
            onClick={onChangeHandler}
            className={`ml-3 px-7 py-3 font-medium text-sm uppercase shadow-md rounded hover:shadow-lg focus:shadow-lg active:shadow-lg transition duration-150 ease-in-out w-full ${
              offer ? 'bg-white text-black' : 'bg-slate-600 text-white'
            } `}
          >
            no
          </button>
        </div>

        {/* Regular Price */}
        <div className="flex justify-start items-center mb-6">
          <div>
            <p className="text-lg font-semibold mt-6 ">Regular price</p>
            <div className="flex w-full justify-center items-center space-x-6">
              <input
                type="number"
                id="regularPrice"
                value={regularPrice}
                onChange={onChangeHandler}
                min="50"
                max="900000000"
                required
                className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
              />
              {type === 'rent' && (
                <div>
                  <p className="text-md w-full whitespace-nowrap">$ / Month</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Discounted price */}
        {offer && (
          <div className="flex justify-start items-center mb-6">
            <div>
              <p className="text-lg font-semibold mt-6 ">Discounted price</p>
              <div className="flex w-full justify-center items-center space-x-6">
                <input
                  type="number"
                  id="discountedPrice"
                  value={discountedPrice}
                  onChange={onChangeHandler}
                  min="50"
                  max="900000000"
                  required={offer}
                  className="w-full px-4 py-2 text-xl text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:text-gray-700 focus:bg-white focus:border-slate-600 text-center"
                />
                {type === 'rent' && (
                  <div>
                    <p className="text-md w-full whitespace-nowrap">
                      $ / Month
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Images */}
        <div className="mb-6 ">
          <p className="text-lg font-semibold ">Images</p>
          <p className="text-gray-600 mb-1">
            The first image will be the cover (max 6)
          </p>
          <input
            type="file"
            id="images"
            onChange={onChangeHandler}
            accept=".jpg,.png,.jpeg"
            multiple
            required
            className="w-full px-3 py-1.5 text-gray-700 bg-white border border-gray-300 rounded transition duration-150 ease-in-out focus:bg-white focus:border-slate-600 "
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="mb-6 w-full px-7 py-3 bg-blue-600 text-white font-medium text-sm uppercase rounded-md shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out  "
        >
          Create Listing
        </button>
      </form>
    </main>
  );
};

export default CreateListing;

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FaMapLocationDot } from "react-icons/fa6";
import { Link } from 'react-router-dom';
import axios from 'axios';

function PlaceCardItem({ place }) {
  const [photoUrl, setPhotoUrl] = useState('');

  // Fetch image from Unsplash API when the place changes
  useEffect(() => {
    if (place) {
      fetchPlaceImage(place.place);
    }
  }, [place]);

  // Function to fetch place image from Unsplash
  const fetchPlaceImage = async (placeName) => {
    try {
      const response = await axios.get(
        `https://api.unsplash.com/search/photos?query=${placeName}&client_id=${process.env.REACT_APP_UNSPLASH_ACCESS_KEY}`
      );
      if (response.data.results.length > 0) {
        // Get the first image result
        setPhotoUrl(response.data.results[0].urls.regular);
      } else {
        setPhotoUrl('/placeholder.jpg');  // Fallback image
      }
    } catch (error) {
      console.error('Error fetching place image from Unsplash:', error);
      setPhotoUrl('/placeholder.jpg');  // Fallback image in case of error
    }
  };

  return (
    <Link to={'https://www.google.com/maps/search/?api=1&query=' + place?.place} target='_blank'>
      <div className='shadow-sm border rounded-xl p-3 mt-2 flex gap-5 hover:scale-105 hover:shadow-md cursor-pointer transition-all'>
        <img
          src={photoUrl || '/placeholder.jpg'}  // Show fetched image or placeholder
          alt="Place"
          className='w-[130px] h-[130px] rounded-xl object-cover'
        />
        <div>
          <h2 className='font-bold text-lg'>{place.place}</h2>
          <p className='text-sm text-gray-500'>{place.details}</p>
          <h2 className='text-xs font-medium mt-2 mb-2'>🏷️Ticket: {place.ticket_pricing}</h2>
        </div>
      </div>
    </Link>
  );
}

export default PlaceCardItem;

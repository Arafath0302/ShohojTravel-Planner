import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchUnsplashImage } from '@/service/GlobalApi';

function UserTripCardItem({ trip }) {
  const [photoUrl, setPhotoUrl] = useState('/placeholder.jpg');

  useEffect(() => {
    const place = trip?.userSelection?.location?.label;
    if (place) {
      fetchUnsplashImage(place)
        .then(response => {
          const url = response.data?.results?.[0]?.urls?.regular;
          setPhotoUrl(url || '/placeholder.jpg');
        })
        .catch(() => setPhotoUrl('/placeholder.jpg'));
    }
  }, [trip]);

  return (
    <Link to={`/view-trip/${trip?.id}`}>
      <div className='hover:scale-105 transition-all'>
        <img src={photoUrl} alt="" className='object-cover rounded-xl h-[220px]' />
        <div>
          <h2 className='font-bold text-lg'>{trip?.userSelection?.location?.label}</h2>
          <h2 className='text-sm text-gray-500'>{trip?.userSelection?.noOfDays} Days trip with {trip?.userSelection?.budget} budget.</h2>
        </div>
      </div>
    </Link>
  );
}

export default UserTripCardItem;

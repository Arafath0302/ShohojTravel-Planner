import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { fetchUnsplashImage } from '@/service/GlobalApi';

function InfoSection({ trip }) {
  const [photoUrl, setPhotoUrl] = useState('/placeholder.jpg');

  useEffect(() => {
    if (trip?.userSelection?.location?.label) {
      fetchPlaceImage(trip?.userSelection?.location?.label);
    }
  }, [trip]);

  const fetchPlaceImage = async (location) => {
    try {
      const response = await fetchUnsplashImage(location);
      const url = response.data?.results?.[0]?.urls?.regular;
      setPhotoUrl(url || '/placeholder.jpg');
    } catch (error) {
      console.error('Error fetching place image from Unsplash:', error);
      setPhotoUrl('/placeholder.jpg');
    }
  };

  return (
    <div>
      <img
        src={photoUrl}
        alt="Trip Location"
        className="h-[340px] w-full object-cover rounded-xl"
      />
      <div>
        <div className="my-5 flex flex-col gap-2">
          <h2 className="font-bold text-2xl">{trip?.userSelection?.location?.label}</h2>
          <div className="flex gap-5">
            <h2 className="p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-xs md:text-md">
              📅 {trip.userSelection?.noOfDays} Day
            </h2>
            <h2 className="p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-xs md:text-md">
              💰 {trip.userSelection?.budget} Budget
            </h2>
            <h2 className="p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-xs md:text-md">
              👥 No. of traveler/s: {trip.userSelection?.traveler}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfoSection;

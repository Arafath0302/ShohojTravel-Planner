import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

function InfoSection({ trip }) {
    const [photoUrl, setPhotoUrl] = useState('');

    useEffect(() => {
        if (trip?.userSelection?.location?.label) {
            fetchPlaceImage(trip?.userSelection?.location?.label);
        }
    }, [trip]);

    const fetchPlaceImage = async (location) => {
        try {
            const UNSPLASH_API_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;
            const response = await axios.get(
                `https://api.unsplash.com/search/photos?query=${location}&client_id=${UNSPLASH_API_KEY}`
            );
            if (response.data.results.length > 0) {
                setPhotoUrl(response.data.results[0].urls.regular); // Use the first image from the results
            } else {
                setPhotoUrl('/placeholder.jpg'); // Use a placeholder if no image is found
            }
        } catch (error) {
            console.error('Error fetching place image from Unsplash:', error);
            setPhotoUrl('/placeholder.jpg'); // Fallback image in case of error
        }
    };

    return (
        <div>
            <img
                src={photoUrl ? photoUrl : '/placeholder.jpg'}
                alt="img"
                className="h-[340px] w-full object-cover rounded-xl"
            />
            <div>
                <div className="my-5 flex flex-col gap-2">
                    <h2 className="font-bold text-2xl">{trip?.userSelection?.location?.label}</h2>
                    <div className="flex gap-5">
                        <h2 className="p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-xs md:text-md">
                            📅{trip.userSelection?.noOfDays} Day
                        </h2>
                        <h2 className="p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-xs md:text-md">
                            💰{trip.userSelection?.budget} Budget
                        </h2>
                        <h2 className="p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-xs md:text-md">
                            👥No. of traveler/s: {trip.userSelection?.traveler}
                        </h2>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InfoSection;

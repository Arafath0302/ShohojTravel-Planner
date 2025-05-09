import { Link } from 'react-router-dom';  // Import Link from react-router-dom
import { useEffect, useState } from 'react';
import axios from 'axios';

// Replace with your Unsplash Access Key
const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY';

function HotelCardItem({ hotel }) {
    const [photoUrl, setPhotoUrl] = useState();

    useEffect(() => {
        hotel && GetPlacePhoto();
    }, [hotel]);

    const GetPlacePhoto = async () => {
        // Fetch images from Unsplash based on the hotel name
        const unsplashURL = `https://api.unsplash.com/search/photos?query=${hotel?.name}&client_id=${UNSPLASH_ACCESS_KEY}`;

        try {
            const response = await axios.get(unsplashURL);
            if (response.data && response.data.results.length > 0) {
                const imageUrl = response.data.results[0].urls.regular;  // Choose the image size you want
                setPhotoUrl(imageUrl);
            }
        } catch (error) {
            console.error('Error fetching image from Unsplash:', error);
            setPhotoUrl('/placeholder.jpg'); // Fallback image in case of error
        }
    };

    return (
        <Link to={'https://www.google.com/maps/search/?api=1&query=' + hotel?.name + "," + hotel?.address} target='_blank'>
            <div className='hover:scale-110 transition-all cursor-pointer mt-5 mb-8'>
                <img src={photoUrl ? photoUrl : '/placeholder.jpg'} className='rounded-xl h-[180px] w-full object-cover' />
                <div className='my-2'>
                    <h2 className='font-medium'>{hotel?.name}</h2>
                    <h2 className='text-xs text-gray-500'>📍{hotel?.address}</h2>
                    <h2 className='text-sm'>💰{hotel?.price}</h2>
                    <h2 className='text-sm'>⭐{hotel?.rating}</h2>
                </div>
            </div>
        </Link>
    );
}

export default HotelCardItem;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/service/firebaseConfig';
import { toast } from 'sonner';
import { fetchUnsplashImage } from '@/service/GlobalApi';
import { FiUsers, FiCalendar, FiDollarSign } from 'react-icons/fi';

function PublicTripCard({ trip }) {
  const [photoUrl, setPhotoUrl] = useState('/placeholder.jpg');
  const [isJoining, setIsJoining] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    // Get current user from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    
    // Check if current user has already joined this trip
    if (currentUser && trip.joinedUsers) {
      setHasJoined(trip.joinedUsers.some(u => u.email === currentUser.email));
    }
    
    // Fetch image for the trip location
    const place = trip?.userSelection?.location?.label;
    if (place) {
      fetchUnsplashImage(place)
        .then(response => {
          const url = response.data?.results?.[0]?.urls?.regular;
          setPhotoUrl(url || '/placeholder.jpg');
        })
        .catch(() => setPhotoUrl('/placeholder.jpg'));
    }
  }, [trip, currentUser]);

  const handleJoinTrip = async () => {
    if (!currentUser) {
      toast.error('Please sign in to join this trip');
      return;
    }
    
    setIsJoining(true);
    try {
      const tripRef = doc(db, 'AITrips', trip.id);
      
      if (hasJoined) {
        // Leave the trip
        await updateDoc(tripRef, {
          joinedUsers: arrayRemove({
            email: currentUser.email,
            name: currentUser.name,
            picture: currentUser.picture
          })
        });
        setHasJoined(false);
        toast.success('You have left this trip');
      } else {
        // Join the trip
        await updateDoc(tripRef, {
          joinedUsers: arrayUnion({
            email: currentUser.email,
            name: currentUser.name,
            picture: currentUser.picture
          })
        });
        setHasJoined(true);
        toast.success('You have joined this trip!');
      }
    } catch (error) {
      console.error('Error joining/leaving trip:', error);
      toast.error(hasJoined ? 'Failed to leave trip' : 'Failed to join trip');
    } finally {
      setIsJoining(false);
    }
  };

  // Get destination name
  const getDestinationName = () => {
    if (trip?.userSelection?.location?.display_name) {
      const fullDestination = trip.userSelection.location.display_name;
      return fullDestination.includes(',') 
          ? fullDestination.split(',')[0].trim() 
          : fullDestination;
    } else if (trip?.userSelection?.location?.label) {
      const fullDestination = trip.userSelection.location.label;
      return fullDestination.includes(',') 
          ? fullDestination.split(',')[0].trim() 
          : fullDestination;
    }
    return "Trip";
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/view-trip/${trip?.id}`}>
        <img 
          src={photoUrl} 
          alt={getDestinationName()} 
          className="w-full h-48 object-cover"
        />
      </Link>
      
      <div className="p-4">
        <Link to={`/view-trip/${trip?.id}`}>
          <h3 className="font-bold text-xl mb-2">{getDestinationName()}</h3>
        </Link>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <FiCalendar className="mr-1" />
            {trip?.userSelection?.noOfDays} days
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FiUsers className="mr-1" />
            {trip?.userSelection?.traveler} traveler(s)
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FiDollarSign className="mr-1" />
            {trip?.userSelection?.budget} budget
          </div>
        </div>
        
        <div className="flex items-center mb-4">
          <img 
            src={trip?.userInfo?.picture || '/user-placeholder.png'} 
            alt="Host" 
            className="w-6 h-6 rounded-full mr-2"
          />
          <span className="text-sm text-gray-600">
            Shared by {trip?.userInfo?.name || 'Anonymous'}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {trip.joinedUsers ? trip.joinedUsers.length : 0} joined
          </div>
          
          <Button 
            variant={hasJoined ? "outline" : "default"}
            onClick={handleJoinTrip}
            disabled={isJoining}
            className={hasJoined ? "border-red-500 text-red-500 hover:bg-red-50" : ""}
          >
            {isJoining ? "Processing..." : hasJoined ? "Leave Trip" : "Join Trip"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PublicTripCard;
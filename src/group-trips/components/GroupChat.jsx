import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FiSend, FiX, FiMessageSquare, FiImage } from 'react-icons/fi';
import { toast } from 'sonner';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/service/firebaseConfig';

function GroupChat({ trip }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [indexError, setIndexError] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Get current user from localStorage
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }

    // Fetch messages when component mounts or isOpen changes
    if (trip?.id && isOpen) {
      console.log("Fetching messages for trip:", trip.id);
      
      // Try to fetch messages without orderBy first if we had an index error
      if (indexError) {
        const simpleQuery = query(
          collection(db, 'tripMessages'),
          where('tripId', '==', trip.id)
        );
        
        getDocs(simpleQuery)
          .then((querySnapshot) => {
            const fetchedMessages = [];
            querySnapshot.forEach((doc) => {
              fetchedMessages.push({
                id: doc.id,
                ...doc.data()
              });
            });
            // Sort manually since we can't use orderBy
            fetchedMessages.sort((a, b) => {
              if (!a.timestamp) return 1;
              if (!b.timestamp) return -1;
              return a.timestamp.seconds - b.timestamp.seconds;
            });
            console.log("Fetched messages (simple query):", fetchedMessages.length);
            setMessages(fetchedMessages);
            scrollToBottom();
          })
          .catch(error => {
            console.error("Error fetching messages (simple query):", error);
            // Removed toast message for error loading messages
          });
      } else {
        // Try with the full query including orderBy
        try {
          const q = query(
            collection(db, 'tripMessages'),
            where('tripId', '==', trip.id),
            orderBy('timestamp', 'asc')
          );

          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedMessages = [];
            querySnapshot.forEach((doc) => {
              fetchedMessages.push({
                id: doc.id,
                ...doc.data()
              });
            });
            console.log("Fetched messages:", fetchedMessages.length);
            setMessages(fetchedMessages);
            
            // Scroll to bottom after messages update
            setTimeout(() => {
              scrollToBottom();
            }, 100);
          }, (error) => {
            console.error("Error fetching messages:", error);
            
            // Check if it's an index error
            if (error.message && error.message.includes("requires an index")) {
              console.log("Index error detected, switching to simple query");
              setIndexError(true);
            }
            
            // Removed toast message for error loading messages
          });

          // Cleanup function
          return () => unsubscribe();
        } catch (error) {
          console.error("Error setting up message listener:", error);
          if (error.message && error.message.includes("requires an index")) {
            setIndexError(true);
          }
          // Removed toast message for error loading messages
        }
      }
    }
  }, [trip, isOpen, indexError]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!currentUser) {
      toast.error('Please sign in to send messages');
      return;
    }

    if ((!message.trim() && !selectedImage) || loading) {
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;

      // Upload image if selected
      if (selectedImage) {
        setUploading(true);
        try {
          // Limit file size more strictly
          if (selectedImage.size > 2 * 1024 * 1024) { // 2MB limit
            toast.error('Image size should be less than 2MB');
            setUploading(false);
            setLoading(false);
            return;
          }

          // Create a unique file name to prevent collisions
          const fileName = `${Date.now()}-${selectedImage.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
          const storageRef = ref(storage, `chat-images/${trip.id}/${fileName}`);
          
          // Log the upload attempt
          console.log("Uploading image:", fileName, "Size:", selectedImage.size);
          
          // Set metadata to ensure proper content type
          const metadata = {
            contentType: selectedImage.type,
          };
          
          // Upload the file with metadata
          const uploadResult = await uploadBytes(storageRef, selectedImage, metadata);
          console.log("Upload complete:", uploadResult);
          
          // Get the download URL
          imageUrl = await getDownloadURL(storageRef);
          console.log("Image URL obtained:", imageUrl);
          
          // Removed toast message for successful image upload
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast.error("Failed to upload image: " + (uploadError.message || "Unknown error"));
          setLoading(false);
          setUploading(false);
          return; // Exit early if image upload fails
        } finally {
          setUploading(false);
        }
      }

      // Only proceed with sending message if there's text or image was uploaded successfully
      if (message.trim() || imageUrl) {
        // Make sure we're using the exact same trip ID format
        const tripId = trip.id;
        
        // Create message data
        const messageData = {
          tripId: tripId,
          text: message.trim(),
          imageUrl: imageUrl,
          sender: {
            id: currentUser.id || currentUser.email,
            name: currentUser.name,
            picture: currentUser.picture
          },
          timestamp: serverTimestamp()
        };
        
        // Add message to Firestore
        console.log("Sending message to Firestore:", messageData);
        const docRef = await addDoc(collection(db, 'tripMessages'), messageData);
        console.log("Message sent with ID:", docRef.id);
        
        // Add local message for immediate display
        const localMessage = {
          ...messageData,
          id: docRef.id,
          timestamp: new Date() // Use local date for display
        };
        
        // Add to messages array if we're not getting real-time updates
        if (indexError) {
          setMessages(prev => [...prev, localMessage]);
          setTimeout(() => {
            scrollToBottom();
          }, 100);
        }
        
        // Removed toast message for successful message sending

        // Clear input fields
        setMessage('');
        setSelectedImage(null);
        setImagePreview(null);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message: ' + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    try {
      // Handle both Firestore Timestamp and JavaScript Date objects
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Just now';
    }
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg flex items-center justify-center"
      >
        <FiMessageSquare size={24} />
      </Button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 w-full md:w-96 h-[600px] bg-white shadow-lg rounded-t-lg flex flex-col z-50">
          {/* Chat Header */}
          <div className="bg-primary text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-bold">Group Chat - {trip?.userSelection?.location?.label || 'Trip'}</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white">
              <FiX size={20} />
            </Button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                No messages yet. Be the first to say hello!
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender.id === currentUser?.id || msg.sender.email === currentUser?.email ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${msg.sender.id === currentUser?.id || msg.sender.email === currentUser?.email ? 'bg-primary text-white' : 'bg-gray-100'} rounded-lg p-3`}>
                    {msg.sender.id !== currentUser?.id && msg.sender.email !== currentUser?.email && (
                      <div className="flex items-center mb-1">
                        <img 
                          src={msg.sender.picture || '/user-placeholder.png'} 
                          alt={msg.sender.name} 
                          className="w-6 h-6 rounded-full mr-2" 
                        />
                        <span className="text-xs font-medium">{msg.sender.name}</span>
                      </div>
                    )}
                    
                    {msg.text && <p className="mb-1">{msg.text}</p>}
                    
                    {msg.imageUrl && (
                      <img 
                        src={msg.imageUrl} 
                        alt="Shared image" 
                        className="rounded-md max-h-60 mt-2 cursor-pointer" 
                        onClick={() => window.open(msg.imageUrl, '_blank')}
                      />
                    )}
                    
                    <div className={`text-xs ${msg.sender.id === currentUser?.id || msg.sender.email === currentUser?.email ? 'text-gray-200' : 'text-gray-500'} mt-1 text-right`}>
                      {formatTimestamp(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="px-4 py-2 border-t">
              <div className="relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="h-20 rounded-md" 
                />
                <button 
                  onClick={removeSelectedImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <FiX size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => fileInputRef.current.click()}
                disabled={uploading || loading}
              >
                <FiImage size={20} />
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </Button>
              
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 resize-none"
                rows={1}
                disabled={uploading || loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              
              <Button 
                onClick={handleSendMessage} 
                disabled={(!message.trim() && !selectedImage) || loading || uploading}
                size="icon"
                className={loading || uploading ? "opacity-50" : ""}
              >
                {loading || uploading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <FiSend size={20} />
                )}
              </Button>
            </div>
            {/* Removed status messages for uploading and sending */}
          </div>
        </div>
      )}
    </>
  );
}

export default GroupChat;
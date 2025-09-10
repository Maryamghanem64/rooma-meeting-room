import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import TypingEffect from "./TypingEffect";
import api, { getMeetings, createMeeting, updateMeeting, deleteMeeting } from "../api/api";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/global.css";

const AdminPanel = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Data
  const [analytics, setAnalytics] = useState({});
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [meetings, setMeetings] = useState([]);

  // Modals
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Profile Forms
  const [profileFormData, setProfileFormData] = useState({ name: "", email: "" });
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  
  // Room Forms
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showEditRoom, setShowEditRoom] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  // User Forms
  const [userFormData, setUserFormData] = useState({ name: "", email: "", role_id: "" });
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState("");
  const [roomFormData, setRoomFormData] = useState({ name: "", users: "", location: "", capacity: "" });

  // Available roles for selection
  const availableRoles = [
    { id: 1, name: "Admin" },
    { id: 2, name: "Employee" },
    { id: 3, name: "Guest" }
  ];
  
  // Available features for selection
  const [availableFeatures, setAvailableFeatures] = useState([]);

  // Meetings state
  const [meetingsSearch, setMeetingsSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const searchTimeoutRef = useRef(null);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(meetingsSearch);
    }, 300); // 300ms debounce delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [meetingsSearch]);

  // Filter meetings based on debounced search
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setFilteredMeetings(meetings);
    } else {
      const filtered = meetings.filter(meeting =>
        meeting.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        meeting.agenda?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        meeting.user_name?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
      setFilteredMeetings(filtered);
    }
  }, [debouncedSearch, meetings]);

  const [meetingFormData, setMeetingFormData] = useState({
    user_name: "",
    room_id: "",
    title: "",
    agenda: "",
    start_time: "",
    end_time: "",
    type: "",
    status: ""
  });
  const [meetingLoading, setMeetingLoading] = useState(false);
  const [meetingError, setMeetingError] = useState("");
  const [showAddMeeting, setShowAddMeeting] = useState(false);
  const [showEditMeeting, setShowEditMeeting] = useState(false);
  const [showViewMeeting, setShowViewMeeting] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch features
        try {
          console.log('Fetching features from API...');
          const featuresResponse = await api.get('/features');
          console.log('Features API response:', featuresResponse.data);
          const featuresData = featuresResponse.data.features || featuresResponse.data;
          console.log('Setting features data:', featuresData);
          setAvailableFeatures(featuresData);
        } catch (error) {
          console.error('Error fetching features:', error);
          // Set default features if API call fails
          console.log('Using fallback features...');
          const fallbackFeatures = [
            { id: 1, name: "Projector" },
            { id: 2, name: "Whiteboard" },
            { id: 3, name: "Video Conference" },
            { id: 4, name: "Audio System" },
            { id: 5, name: "TV Screen" },
            { id: 6, name: "Microphones" },
            { id: 7, name: "Interactive Whiteboard" },
            { id: 8, name: "Recording Equipment" }
          ];
          setAvailableFeatures(fallbackFeatures);
          console.log('Fallback features set:', fallbackFeatures);
        }
        
        const usersResponse = await api.get('/users');
        console.log('Users API response:', usersResponse.data);
        
        // Handle Laravel API response structure
        let usersData = [];
        if (usersResponse.data && Array.isArray(usersResponse.data)) {
          // Direct array response
          usersData = usersResponse.data;
        } else if (usersResponse.data && usersResponse.data.data && Array.isArray(usersResponse.data.data)) {
          // Laravel paginated response with data property
          usersData = usersResponse.data.data;
        } else if (usersResponse.data && usersResponse.data.users && Array.isArray(usersResponse.data.users)) {
          // Custom response with users property
          usersData = usersResponse.data.users;
        }
        
        // Process users data to handle Laravel response structure
        const processedUsers = usersData.map((user) => {
          // Handle different ID field names from Laravel
          const userId = user.Id !== undefined ? user.Id : 
                        user.id !== undefined ? user.id : 
                        user.user_id !== undefined ? user.user_id : null;
          
          // Handle role field - could be role object or string
          let userRole = "No role assigned";
          if (user.role) {
            if (typeof user.role === 'object' && user.role.name) {
              userRole = user.role.name;
            } else if (typeof user.role === 'string') {
              userRole = user.role;
            }
          }
          
          return {
            ...user,
            id: userId,
            role: userRole,
            // Preserve role_id for form updates if available
            role_id: user.role_id || (user.role && typeof user.role === 'object' ? user.role.id : null)
          };
        });
        
        console.log('Processed Users:', processedUsers);
        
        setUsers(processedUsers);
        setAnalytics(prev => ({ ...prev, totalUsers: usersData.length }));
        
        // Fetch rooms data
        await fetchRooms();

        // Fetch meetings data
        await fetchMeetings();
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setAnalytics({ totalRooms: 5, totalUsers: 0, totalMeetings: 8 });
        
        // Try to load rooms from localStorage as fallback
        try {
          const storedRooms = localStorage.getItem("rooms");
          if (storedRooms) {
            const parsedRooms = JSON.parse(storedRooms);
            setRooms(parsedRooms);
            console.log("Loaded rooms from localStorage as fallback in error handler");
          } else {
            // Fallback to mock data if localStorage is empty
            setRooms([
              { id: 1, name: "Room A", location: "Floor 1", capacity: 10, features: [1] },
              { id: 2, name: "Room B", location: "Floor 2", capacity: 6, features: [2] },
            ]);
          }
        } catch (localStorageError) {
          console.error("Error loading rooms from localStorage in error handler:", localStorageError);
          setRooms([
            { id: 1, name: "Room A", location: "Floor 1", capacity: 10, features: [1] },
            { id: 2, name: "Room B", location: "Floor 2", capacity: 6, features: [2] },
          ]);
        }
        
        setMeetings([
          { id: 1, title: "Team Sync", organizer: "Alice", date: "2025-08-21", status: "Pending" },
          { id: 2, title: "Project Review", organizer: "Bob", date: "2025-08-22", status: "Ongoing" },
        ]);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (user) setProfileFormData({ name: user.name || "", email: user.email || "" });
  }, [user]);

  // Remove the old useEffect for selectedRoom normalization

  // toggleFeature function to add/remove feature id with guard
  const toggleFeature = (id) => {
    if (!Number.isFinite(id)) return;
    setSelectedFeatures(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleProfileInputChange = e => setProfileFormData({ ...profileFormData, [e.target.name]: e.target.value });
  const handleUserInputChange = e => setUserFormData({ ...userFormData, [e.target.name]: e.target.value });
  
  // Handle room form input changes
  const handleRoomInputChange = e => {
    const { name, value } = e.target;
    setRoomFormData(prev => ({ ...prev, [name]: value }));
  };

const handleSaveProfile = async () => {
    // Update user state after successful profile update
    if (!profileFormData.email.includes('@')) return setProfileError("Invalid email");
    setProfileLoading(true);
    setProfileError("");
    setProfileSuccess("");
    try {
      const result = await updateProfile(profileFormData);
      if (result.success) {
        setProfileSuccess("Profile updated successfully!");
        toast.success("Profile updated successfully!");
        setTimeout(() => setShowEditProfile(false), 1500);
      } else {
        setProfileError(result.error || "Failed to update profile");
        toast.error(result.error || "Failed to update profile");
        console.error("Profile update error:", result.error);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || "Failed to update profile. Please try again.";
      setProfileError(errorMsg);
      toast.error(errorMsg);
      console.error("Error updating profile:", err);
    } finally {
      setProfileLoading(false);
    }
  };

const handleAddUser = async () => {
    const selectedRole = availableRoles.find(role => role.id === parseInt(userFormData.role_id));
    if (!selectedRole) {
        setUserError("Invalid role selected");
        return;
    }
    console.log("Adding User with Data:", userFormData); // Log user data
    console.log("Selected Role ID:", userFormData.role_id); // Log role ID
    console.log("Adding User with Data:", userFormData); // Log user data
    if (!userFormData.email.includes('@')) return setUserError("Invalid email");
    setUserLoading(true);
    setUserError("");
    try {
      const result = await api.post('/users', userFormData);
      // Handle different response structures
      let newUser = null;
      if (result.data.success && result.data.user) {
        newUser = result.data.user;
      } else if (result.data.user) {
        newUser = result.data.user;
      } else if (result.data.data) {
        newUser = result.data.data;
      } else {
        newUser = result.data;
      }
      
      if (newUser) {
        // Normalize the new user data with proper role handling
        let userRole = "No role assigned";
        if (newUser.roles && Array.isArray(newUser.roles) && newUser.roles.length > 0) {
          userRole = newUser.roles.map(r => r.name || r).join(", ");
        } else if (newUser.role) {
          if (typeof newUser.role === 'object' && newUser.role.name) {
            userRole = newUser.role.name;
          } else if (typeof newUser.role === 'string') {
            userRole = newUser.role;
          }
        }
        const normalizedUser = {
          ...newUser,
          id: newUser.id !== undefined ? newUser.id : Date.now(), // Use timestamp as fallback ID for new users
          role: userRole,
          roles: newUser.roles || (newUser.role && typeof newUser.role === 'object' ? [newUser.role] : [])
        };
        setUsers([...users, normalizedUser]);
        setShowAddUser(false);
        setUserFormData({ name: "", email: "", role_id: "" });
      } else {
        setUserError("Failed to add user: Unexpected response format");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Server error";
      setUserError(errorMsg);
    } finally { setUserLoading(false); }
  };

  const handleSaveUser = async () => {
    if (!selectedUser || !selectedUser.id) {
      setUserError("Cannot update user: Invalid user selection");
      return;
    }
    if (!userFormData.email.includes('@')) return setUserError("Invalid email");
    setUserLoading(true);
    setUserError("");
    try {
      const result = await api.put(`/users/${selectedUser.id}`, userFormData);
      // Handle different response structures
      let updatedUser = null;
      if (result.data.success && result.data.user) {
        updatedUser = result.data.user;
      } else if (result.data.user) {
        updatedUser = result.data.user;
      } else if (result.data.data) {
        updatedUser = result.data.data;
      } else {
        updatedUser = result.data;
      }
      
      if (updatedUser) {
        // Normalize the updated user data with proper role handling
        let userRole = "No role assigned";
        if (updatedUser.roles && Array.isArray(updatedUser.roles) && updatedUser.roles.length > 0) {
          userRole = updatedUser.roles.map(r => r.name || r).join(", ");
        } else if (updatedUser.role) {
          if (typeof updatedUser.role === 'object' && updatedUser.role.name) {
            userRole = updatedUser.role.name;
          } else if (typeof updatedUser.role === 'string') {
            userRole = updatedUser.role;
          }
        }
        const normalizedUser = {
          ...updatedUser,
          id: updatedUser.id !== undefined ? updatedUser.id : selectedUser.id,
          role: userRole,
          roles: updatedUser.roles || (updatedUser.role && typeof updatedUser.role === 'object' ? [updatedUser.role] : [])
        };
        setUsers(users.map(u => u.id === selectedUser.id ? normalizedUser : u));
        setShowEditUser(false);
        setUserFormData({ name: "", email: "", role_id: "" });
        setSelectedUser(null);
      } else {
        setUserError("Failed to update user: Unexpected response format");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Server error";
      setUserError(errorMsg);
    } finally { setUserLoading(false); }
  };

  const handleDeleteUser = async (id) => {
    if (!id) {
      setUserError("Cannot delete user: Invalid user ID");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setUserError("");
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Server error";
      setUserError(errorMsg);
    }
  };

  const handleAddRoom = async () => {
    if (!roomFormData.name.trim() || !roomFormData.location.trim() || !roomFormData.capacity) return;
    try {
      // Prepare room data with features as an array of unique IDs
      const roomData = {
        ...roomFormData,
        features: [...new Set(selectedFeatures.filter(id => id && Number.isFinite(id)))]
      };

      console.log("Adding room with data:", roomData); // Debug log

      const response = await api.post('/rooms', roomData);
      const newRoom = response.data.room || response.data.data || response.data; // Handle different response structures

      console.log("Room added successfully:", newRoom); // Debug log

      const updatedRooms = [...rooms, newRoom];
      setRooms(updatedRooms);
      // Update localStorage with the latest rooms data
      localStorage.setItem("rooms", JSON.stringify(updatedRooms));
      setShowAddRoom(false);
      // Reset form
      setRoomFormData({ name: "", users: "", location: "", capacity: "" });
      setSelectedFeatures([]);

      toast.success("Room added successfully!");
    } catch (error) {
      console.error("Error adding room:", error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Failed to add room";
      toast.error(errorMsg);
    }
  };

  // Remove duplicate fetchRooms call - rooms are already fetched in the main useEffect
  
  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms');
      // Handle different response structures
      let roomsData = [];
      if (response.data && Array.isArray(response.data)) {
        roomsData = response.data;
      } else if (response.data && response.data.rooms && Array.isArray(response.data.rooms)) {
        roomsData = response.data.rooms;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        roomsData = response.data.data;
      }

      // Normalize rooms data to ensure consistent id field
      const normalizedRooms = roomsData.map(room => ({
        ...room,
        id: room.id || room.Id || room.room_id || room.name // Use name as fallback if no id
      }));

      setRooms(normalizedRooms);
      // Update analytics totalRooms based on fetched rooms
      setAnalytics(prev => ({ ...prev, totalRooms: normalizedRooms.length }));
      // Update localStorage with the normalized rooms data
      localStorage.setItem("rooms", JSON.stringify(normalizedRooms));
      } catch (error) {
        console.error("Error fetching rooms from API:", error);
        // Fallback to localStorage if API call fails
        try {
          const storedRooms = localStorage.getItem("rooms");
          if (storedRooms) {
            const parsedRooms = JSON.parse(storedRooms);
            // Normalize stored rooms as well
            const normalizedStoredRooms = parsedRooms.map(room => ({
              ...room,
              id: room.id || room.Id || room.room_id || room.name
            }));
            setRooms(normalizedStoredRooms);
            // Update analytics totalRooms based on rooms loaded from localStorage
            setAnalytics(prev => ({ ...prev, totalRooms: normalizedStoredRooms.length }));
            console.log("Loaded rooms from localStorage as fallback");
          }
        } catch (localStorageError) {
          console.error("Error loading rooms from localStorage:", localStorageError);
        }
      }
  };

  const handleSaveRoom = async () => {
    console.log("handleSaveRoom called");
    console.log("selectedRoom:", selectedRoom);
    console.log("roomFormData:", roomFormData);
    console.log("selectedFeatures:", selectedFeatures);

    if (!selectedRoom || (!selectedRoom.id && !selectedRoom.Id)) {
      console.error("Invalid selectedRoom or missing ID:", selectedRoom);
      toast.error("Cannot save room: Invalid room selection");
      return;
    }

    // Validate required fields
    if (!roomFormData.name?.trim() || !roomFormData.location?.trim() || !roomFormData.capacity) {
      console.error("Missing required fields:", roomFormData);
      toast.error("Please fill in all required fields (Name, Location, Capacity)");
      return;
    }

    try {
      // Prepare room data with features as an array of unique IDs
      const roomData = {
        name: roomFormData.name.trim(),
        location: roomFormData.location.trim(),
        capacity: parseInt(roomFormData.capacity, 10),
        features: [...new Set(selectedFeatures.filter(id => id && Number.isFinite(id)))]
      };

      console.log("Updating room with data:", roomData); // Debug log
      const roomId = selectedRoom.id || selectedRoom.Id;
      console.log("API URL:", `/rooms/${roomId}`);

      const response = await api.put(`/rooms/${roomId}`, roomData);
      console.log("API Response:", response);

      const updatedRoom = response.data.room || response.data.data || response.data; // Handle different response structures

      console.log("Room updated successfully:", updatedRoom); // Debug log

      // Normalize the returned room's features to ensure consistency
      const normalized = {
        ...updatedRoom,
        id: updatedRoom.id || updatedRoom.Id || selectedRoom.id, // Ensure ID consistency
        features: Array.isArray(updatedRoom.features)
          ? (typeof updatedRoom.features[0] === "object"
              ? updatedRoom.features.map(x => x.id || x.Id || x.feature_id)
              : updatedRoom.features)
          : []
      };

      console.log("Normalized room:", normalized);

      const updatedRooms = rooms.map(r => (r.id === normalized.id ? normalized : r));
      setRooms(updatedRooms);
      // Update localStorage with the latest rooms data
      localStorage.setItem("rooms", JSON.stringify(updatedRooms));
      setShowEditRoom(false);
      // Reset form
      setRoomFormData({ name: "", users: "", location: "", capacity: "" });
      setSelectedFeatures([]);
      setSelectedRoom(null);

      toast.success("Room updated successfully!");
    } catch (error) {
      console.error("Error updating room:", error);
      console.error("Error response:", error.response);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || "Failed to update room";
      toast.error(`Error: ${errorMsg}`);
    }
  };

  const handleDeleteRoom = async (id) => {
    if (!id) return;
    try {
      await api.delete(`/rooms/${id}`);
      const updatedRooms = rooms.filter(r => r.id !== id);
      setRooms(updatedRooms);
      // Update localStorage with the latest rooms data
      localStorage.setItem("rooms", JSON.stringify(updatedRooms));
    } catch (error) {
      console.error("Error deleting room:", error);
    }
  };

  // Meetings functions
  const fetchMeetings = async () => {
    try {
      const response = await getMeetings();
      let meetingsData = [];
      if (response.data && Array.isArray(response.data)) {
        meetingsData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        meetingsData = response.data.data;
      } else if (response.data && response.data.meetings && Array.isArray(response.data.meetings)) {
        meetingsData = response.data.meetings;
      }

      // Debug: Log the raw meetings data to see status values
      console.log("Raw meetings data from API:", meetingsData);
      console.log("Status values in meetings:", meetingsData.map(m => ({ id: m.id, status: m.status })));

      // Normalize meetings data to ensure consistent id field
      const normalizedMeetings = meetingsData.map(meeting => ({
        ...meeting,
        id: meeting.id || meeting.Id || meeting.meeting_id || meeting.meetingId
      }));

      setMeetings(normalizedMeetings);
      setFilteredMeetings(normalizedMeetings);
      setAnalytics(prev => ({ ...prev, totalMeetings: normalizedMeetings.length }));
    } catch (error) {
      console.error("Error fetching meetings:", error);
      // Keep existing mock data as fallback
      setFilteredMeetings(meetings);
    }
  };

  const handleMeetingInputChange = (e) => {
    const { name, value } = e.target;
    setMeetingFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMeeting = async () => {
    if (!meetingFormData.title.trim() || !meetingFormData.user_name.trim()) {
      setMeetingError("Title and User Name are required");
      return;
    }
    if (!meetingFormData.start_time || !meetingFormData.end_time) {
      setMeetingError("Start Time and End Time are required");
      return;
    }
    if (!meetingFormData.status) {
      setMeetingError("Status is required");
      return;
    }

    // Map user_name to userId
    const user = users.find(u => u.name === meetingFormData.user_name);
    if (!user || !user.id) {
      setMeetingError("Invalid user selected");
      return;
    }
    const userId = user.id;

    // Validate room_id - handle both string and number IDs
    const roomId = meetingFormData.room_id;
    if (!roomId || roomId === "") {
      setMeetingError("Please select a room");
      return;
    }

    // Check if rooms array is loaded
    if (!rooms || rooms.length === 0) {
      setMeetingError("Rooms are still loading. Please wait and try again.");
      return;
    }

    // Check if room exists in the rooms list - compare as strings to handle mixed types
    const selectedRoom = rooms.find(r => {
      if (!r || (!r.id && r.id !== 0)) return false;
      return String(r.id) === String(roomId);
    });

    if (!selectedRoom) {
      console.error("Room validation failed:", {
        roomId,
        availableRooms: rooms.map(r => ({ id: r.id, name: r.name })),
        formData: meetingFormData
      });
      setMeetingError(`Selected room (ID: ${roomId}) does not exist in the current room list. Please refresh the page and try again.`);
      return;
    }

    // Validate status
    const validStatuses = ["pending", "ongoing", "completed", "cancelled", "scheduled"];
    if (!validStatuses.includes(meetingFormData.status.toLowerCase())) {
      setMeetingError("Invalid status selected");
      return;
    }

    // Prepare payload with correct field names (camelCase as expected by API)
    const payload = {
      userId: userId,
      roomId: roomId,
      title: meetingFormData.title,
      agenda: meetingFormData.agenda,
      startTime: meetingFormData.start_time,
      endTime: meetingFormData.end_time,
      type: meetingFormData.type,
      status: meetingFormData.status
    };

    setMeetingLoading(true);
    setMeetingError("");
    try {
      const response = await createMeeting(payload);
      const newMeeting = response.data.meeting || response.data.data || response.data;
      setMeetings(prev => [...prev, newMeeting]);
      setFilteredMeetings(prev => [...prev, newMeeting]);
      setAnalytics(prev => ({ ...prev, totalMeetings: prev.totalMeetings + 1 }));
      setShowAddMeeting(false);
      setMeetingFormData({
        user_name: "",
        room_id: "",
        title: "",
        agenda: "",
        start_time: "",
        end_time: "",
        type: "",
        status: ""
      });
      toast.success("Meeting created successfully!");
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Failed to create meeting";
      setMeetingError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setMeetingLoading(false);
    }
  };

  const handleEditMeeting = async () => {
    console.log("handleEditMeeting called with:", { selectedMeeting, meetingFormData });

    // Clear any previous errors
    setMeetingError("");

    if (!selectedMeeting || !selectedMeeting.id) {
      const errorMsg = "Invalid meeting selection";
      console.error(errorMsg, selectedMeeting);
      setMeetingError(errorMsg);
      return;
    }

    // Validate required fields
    if (!meetingFormData.title || !meetingFormData.title.trim()) {
      const errorMsg = "Title is required";
      console.error(errorMsg);
      setMeetingError(errorMsg);
      return;
    }

    if (!meetingFormData.user_name || !meetingFormData.user_name.trim()) {
      const errorMsg = "User Name is required";
      console.error(errorMsg);
      setMeetingError(errorMsg);
      return;
    }

    if (!meetingFormData.start_time) {
      const errorMsg = "Start Time is required";
      console.error(errorMsg);
      setMeetingError(errorMsg);
      return;
    }

    if (!meetingFormData.end_time) {
      const errorMsg = "End Time is required";
      console.error(errorMsg);
      setMeetingError(errorMsg);
      return;
    }

    // Validate that end time is after start time
    const startTime = new Date(meetingFormData.start_time);
    const endTime = new Date(meetingFormData.end_time);
    if (endTime <= startTime) {
      const errorMsg = "End Time must be after Start Time";
      console.error(errorMsg, { startTime, endTime });
      setMeetingError(errorMsg);
      return;
    }

    if (!meetingFormData.status) {
      const errorMsg = "Status is required";
      console.error(errorMsg);
      setMeetingError(errorMsg);
      return;
    }

    // Map user_name to userId
    const user = users.find(u => u.name === meetingFormData.user_name);
    if (!user || !user.id) {
      setMeetingError("Invalid user selected");
      return;
    }
    const userId = user.id;

    // Validate room_id - handle both string and number IDs
    const roomId = meetingFormData.room_id;
    if (!roomId || roomId === "") {
      setMeetingError("Please select a room");
      return;
    }

    // Check if rooms array is loaded
    if (!rooms || rooms.length === 0) {
      setMeetingError("Rooms are still loading. Please wait and try again.");
      return;
    }

    // Check if room exists in the rooms list - compare as strings to handle mixed types
    const selectedRoom = rooms.find(r => {
      if (!r || (!r.id && r.id !== 0)) return false;
      return String(r.id) === String(roomId);
    });

    if (!selectedRoom) {
      console.error("Room validation failed:", {
        roomId,
        availableRooms: rooms.map(r => ({ id: r.id, name: r.name })),
        formData: meetingFormData
      });
      setMeetingError(`Selected room (ID: ${roomId}) does not exist in the current room list. Please refresh the page and try again.`);
      return;
    }

    // Validate status
    const validStatuses = ["pending", "ongoing", "completed", "cancelled", "scheduled"];
    if (!validStatuses.includes(meetingFormData.status.toLowerCase())) {
      setMeetingError("Invalid status selected");
      return;
    }

    // Prepare payload with correct field names (camelCase as expected by API)
    const payload = {
      userId: userId,
      roomId: roomId,
      title: meetingFormData.title,
      agenda: meetingFormData.agenda,
      startTime: meetingFormData.start_time,
      endTime: meetingFormData.end_time,
      type: meetingFormData.type,
      status: meetingFormData.status
    };

    setMeetingLoading(true);
    setMeetingError("");
    try {
      const response = await updateMeeting(selectedMeeting.id, payload);
      const updatedMeeting = response.data.meeting || response.data.data || response.data;
      setMeetings(prev => prev.map(m => m.id === selectedMeeting.id ? updatedMeeting : m));
      setFilteredMeetings(prev => prev.map(m => m.id === selectedMeeting.id ? updatedMeeting : m));
      setShowEditMeeting(false);
      setSelectedMeeting(null);
      setMeetingFormData({
        user_name: "",
        room_id: "",
        title: "",
        agenda: "",
        start_time: "",
        end_time: "",
        type: "",
        status: ""
      });
      toast.success("Meeting updated successfully!");
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Failed to update meeting";
      setMeetingError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setMeetingLoading(false);
    }
  };

  const handleDeleteMeeting = async (id) => {
    console.log("handleDeleteMeeting called with id:", id);
    if (!id) {
      console.error("handleDeleteMeeting: Invalid id provided");
      return;
    }
    // Removed confirmation dialog as per user request
    try {
      console.log("handleDeleteMeeting: Calling deleteMeeting API with id:", id);
      const response = await deleteMeeting(id);
      console.log("handleDeleteMeeting: API response:", response);
      setMeetings(prev => prev.filter(m => m.id !== id));
      setFilteredMeetings(prev => prev.filter(m => m.id !== id));
      setAnalytics(prev => ({ ...prev, totalMeetings: prev.totalMeetings - 1 }));
      console.log("handleDeleteMeeting: State updated successfully");
      // Removed toast notification as per user request
    } catch (error) {
      console.error("handleDeleteMeeting: Error deleting meeting:", error);
      console.error("handleDeleteMeeting: Error response:", error.response);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || "Failed to delete meeting";
      console.error("handleDeleteMeeting: Error message:", errorMsg);
      // Removed toast error notification as per user request
    }
  };

  const handleSearchMeetings = (searchTerm) => {
    setMeetingsSearch(searchTerm);
    if (!searchTerm.trim()) {
      setFilteredMeetings(meetings);
    } else {
      const filtered = meetings.filter(meeting =>
        meeting.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.agenda?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMeetings(filtered);
    }
  };

  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary"/></div>;

  return (
    <div className="container py-4">
      <div className="text-center mb-4">
        <h2 className="fw-bold text-primary">Admin Panel</h2>
        <TypingEffect text="Manage rooms, users, and meetings" />
      </div>

      <ul className="nav nav-tabs mb-4">
        {["dashboard", "users", "rooms", "meetings", "profile"].map(tab => (
          <li className="nav-item" key={tab}>
            <button className={`nav-link ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          </li>
        ))}
      </ul>

      {activeTab === "dashboard" && (
        <div className="row mb-4">
          {[
            { title: "Total Rooms", value: analytics.totalRooms, icon: "fas fa-door-open" },
            { title: "Total Users", value: analytics.totalUsers, icon: "fas fa-users" },
            { title: "Total Meetings", value: analytics.totalMeetings, icon: "fas fa-calendar-alt" },
          ].map((c, i) => (
            <div className="col-md-4 mb-3" key={c.title}>
              <div className="card shadow-sm text-center p-3">
                <i className={`${c.icon} fa-2x mb-2 text-primary`}></i>
                <h5>{c.title}</h5>
                <p className="display-6">{c.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "users" && (
        <div className="card shadow-sm mb-4">
          <div className="card-header d-flex justify-content-between">
            <h5>Users</h5>
            <button className="btn btn-sm btn-primary" onClick={() => setShowAddUser(true)}>+ Add User</button>
          </div>
          <div className="card-body table-responsive">
            {userError && <div className="alert alert-danger">{userError}</div>}
            <table className="table table-hover">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map((u, index) => (
                  <tr key={u.id || `user-${index}`}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role || "No role assigned"}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => { 
                        setSelectedUser(u); 
                        setUserFormData({ 
                          name: u.name || "", 
                          email: u.email || "", 
                          role_id: u.role_id || "" 
                        }); 
                        setShowEditUser(true); 
                      }}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteUser(u.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "rooms" && (
        <div className="card shadow-sm mb-4">
          <div className="card-header d-flex justify-content-between">
            <h5>Rooms</h5>
            <button className="btn btn-sm btn-primary" onClick={() => { setSelectedFeatures([]); setShowAddRoom(true); }}>+ Add Room</button>
          </div>
          <div className="card-body table-responsive">
            <table className="table table-hover">
              <thead><tr><th>Name</th><th>Location</th><th>Capacity</th><th>Features</th><th>Actions</th></tr></thead>
              <tbody>
                {rooms.map((r, index) => (
                  <tr key={r.id || `room-${index}`}>
                    <td>{r.name}</td>
                    <td>{r.location}</td>
                    <td>{r.capacity}</td>
                    <td style={{ minWidth: '250px', whiteSpace: 'nowrap' }}>
                      {Array.isArray(r.features) && r.features.length > 0
                        ? r.features.map(featureId => {
                            // featureId might be an object, handle that case
                            if (typeof featureId === 'object' && featureId !== null) {
                              if (featureId.name) {
                                return featureId.name;
                              } else {
                                const id = featureId.id || featureId.Id || featureId.feature_id;
                                const normalizedId = id?.toString();
                                const feature = availableFeatures.find(f => f.id?.toString() === normalizedId);
                                return feature ? feature.name : `Feature ${normalizedId}`;
                              }
                            } else {
                              // featureId is a number or string, find the feature
                              const normalizedId = featureId?.toString();
                              const feature = availableFeatures.find(f => f.id?.toString() === normalizedId);
                              return feature ? feature.name : `Feature ${normalizedId}`;
                            }
                          }).join(", ")
                        : 'No features'}
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => {
                        console.log("Edit button clicked for room:", r); // Debug log
                        // Normalize the room ID to ensure consistency
                        const normalizedRoom = {
                          ...r,
                          id: r.id || r.Id || r.room_id
                        };
                        setSelectedRoom(normalizedRoom);
                        setRoomFormData({
                          name: r.name || "",
                          location: r.location || "",
                          capacity: r.capacity || "",
                          users: r.users || ""
                        });
                        setSelectedFeatures(
                          Array.isArray(r.features)
                            ? (typeof r.features[0] === "object"
                                ? r.features.map(x => x.id || x.Id || x.feature_id)
                                : r.features.map(n => parseInt(n, 10)))
                            : []
                        );
                        setShowEditRoom(true);
                        console.log("showEditRoom set to true"); // Debug log
                      }}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteRoom(r.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "meetings" && (
        <div className="card shadow-sm mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5>Meetings</h5>
            <button className="btn btn-sm btn-primary" onClick={() => setShowAddMeeting(true)}>+ Add Meeting</button>
          </div>
          <div className="card-body">
            <input
              className="form-control mb-3"
              placeholder="Search meetings..."
              value={meetingsSearch}
              onChange={(e) => handleSearchMeetings(e.target.value)}
            />
            {meetingError && <div className="alert alert-danger">{meetingError}</div>}
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Organizer</th>
                    <th>Room</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMeetings.map((m, index) => (
                    <tr key={m.id || `meeting-${index}`}>
                      <td>{m.title}</td>
                      <td>{users.find(u => u.id === m.userId)?.name || 'Unknown'}</td>
                      <td>{rooms.find(r => String(r.id) === String(m.roomId))?.name || 'Unknown'}</td>
                      <td>{m.startTime ? new Date(m.startTime).toLocaleString() : 'N/A'}</td>
                      <td>{m.endTime ? new Date(m.endTime).toLocaleString() : 'N/A'}</td>
                      <td>{m.type || ''}</td>
                      <td>
                        <span className={`badge ${m.status === 'ongoing' ? 'bg-success' : m.status === 'pending' ? 'bg-warning' : m.status === 'completed' ? 'bg-primary' : m.status === 'cancelled' ? 'bg-danger' : m.status === 'scheduled' ? 'bg-info' : 'bg-secondary'}`}>
                          {m.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => {
                            console.log("Edit button clicked for meeting:", m);
                            console.log("Meeting ID:", m.id, "Type:", typeof m.id);
                            console.log("Meeting userId:", m.userId, "roomId:", m.roomId);

                            // Normalize the meeting object to ensure consistent id field
                            const normalizedMeeting = {
                              ...m,
                              id: m.id || m.Id || m.meeting_id || m.meetingId
                            };

                            console.log("Normalized meeting:", normalizedMeeting);

                            setSelectedMeeting(normalizedMeeting);

                            // Find the user_name from userId and room_id from roomId for the form
                            const user = users.find(u => u.id === normalizedMeeting.userId);
                            const room = rooms.find(r => r.id === normalizedMeeting.roomId);

                            console.log("Found user:", user, "Found room:", room);

                            const formData = {
                              user_name: user ? user.name : "",
                              room_id: room ? room.id : "",
                              title: normalizedMeeting.title || "",
                              agenda: normalizedMeeting.agenda || "",
                              start_time: normalizedMeeting.startTime || "",
                              end_time: normalizedMeeting.endTime || "",
                              type: normalizedMeeting.type || "",
                              status: normalizedMeeting.status || ""
                            };

                            console.log("Setting meeting form data:", formData);
                            setMeetingFormData(formData);
                            setShowEditMeeting(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => {
                            const meetingId = m.id || m.Id || m.meeting_id || m.meetingId;
                            // More robust check for valid ID (not undefined, null, or "undefined")
                            if (meetingId && meetingId !== "undefined" && meetingId !== "null") {
                              handleDeleteMeeting(meetingId);
                            } else {
                              console.error("Cannot delete meeting: no valid id found", m);
                              toast.error("Cannot delete meeting: invalid meeting data");
                            }
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="card shadow-sm mb-4">
          <div className="card-header d-flex justify-content-between">
            <h5>Profile</h5>
            <button className="btn btn-sm btn-primary" onClick={() => setShowEditProfile(true)}>Edit Profile</button>
          </div>
          <div className="card-body">
            <p style={{ color: 'black' }}><strong>Name:</strong> {user?.name}</p>
            <p style={{ color: 'black' }}><strong>Email:</strong> {user?.email}</p>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddUser && (
        <div className="modal show d-block" tabIndex="-1"><div className="modal-dialog"><div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Add User</h5><button className="btn-close" onClick={() => { setShowAddUser(false); setUserError(""); }}></button></div>
          <div className="modal-body">
            {userError && <div className="alert alert-danger">{userError}</div>}
            <input className="form-control mb-2" placeholder="Name" name="name" value={userFormData.name || ""} onChange={handleUserInputChange}/>
            <input className="form-control mb-2" placeholder="Email" name="email" value={userFormData.email || ""} onChange={handleUserInputChange}/>
            <select className="form-control mb-2" name="role_id" value={userFormData.role_id || ""} onChange={handleUserInputChange}>
              <option value="">Select Role</option>
              {availableRoles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => { setShowAddUser(false); setUserError(""); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddUser} disabled={userLoading}>
              {userLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div></div></div>
      )}
      
      {showAddMeeting && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Meeting</h5>
                <button className="btn-close" onClick={() => { setShowAddMeeting(false); setMeetingError(""); }}></button>
              </div>
              <div className="modal-body">
                {meetingError && <div className="alert alert-danger">{meetingError}</div>}
                <input
                  className="form-control mb-2"
                  placeholder="Title"
                  name="title"
                  value={meetingFormData.title}
                  onChange={handleMeetingInputChange}
                />
                <select
                  className="form-control mb-2"
                  name="user_name"
                  value={meetingFormData.user_name}
                  onChange={handleMeetingInputChange}
                >
                  <option key="select-user-default" value="">Select User</option>
                  {users.map(u => (
                    <option key={`user-${u.id || u.Id || `fallback-${u.name}`}`} value={u.name}>{u.name}</option>
                  ))}
                </select>
                <select
                  className="form-control mb-2"
                  name="room_id"
                  value={meetingFormData.room_id}
                  onChange={handleMeetingInputChange}
                >
                  <option key="select-room-default" value="">Select Room</option>
                  {rooms.map((r, index) => {
                    // Use normalized id field
                    const roomId = r.id;
                    const roomName = r.name || r.room_name || `Room ${roomId}`;
                    return (
                      <option key={`room-option-add-${roomId || `fallback-${index}`}`} value={roomId}>
                        {roomName}
                      </option>
                    );
                  })}
                </select>
                <textarea
                  className="form-control mb-2"
                  placeholder="Agenda"
                  name="agenda"
                  value={meetingFormData.agenda}
                  onChange={handleMeetingInputChange}
                />
                <input
                  className="form-control mb-2"
                  type="datetime-local"
                  placeholder="Start Time"
                  name="start_time"
                  value={meetingFormData.start_time}
                  onChange={handleMeetingInputChange}
                />
                <input
                  className="form-control mb-2"
                  type="datetime-local"
                  placeholder="End Time"
                  name="end_time"
                  value={meetingFormData.end_time}
                  onChange={handleMeetingInputChange}
                />
                <input
                  className="form-control mb-2"
                  placeholder="Type"
                  name="type"
                  value={meetingFormData.type}
                  onChange={handleMeetingInputChange}
                />
                <select
                  className="form-control mb-2"
                  name="status"
                  value={meetingFormData.status}
                  onChange={handleMeetingInputChange}
                >
                  <option value="">Select Status</option>
                  <option value="pending">Pending</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => { setShowAddMeeting(false); setMeetingError(""); }}>Cancel</button>
                <button className="btn btn-primary" onClick={handleAddMeeting} disabled={meetingLoading}>
                  {meetingLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditMeeting && (
        <>
          <div className="modal-backdrop show"></div>
          <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Meeting</h5>
                  <button className="btn-close" onClick={() => { setShowEditMeeting(false); setMeetingError(""); setSelectedMeeting(null); setMeetingFormData({ user_name: "", room_id: "", title: "", agenda: "", start_time: "", end_time: "", type: "", status: "" }); }}></button>
                </div>
                <div className="modal-body">
                  {meetingError && <div className="alert alert-danger">{meetingError}</div>}
                  <div className="mb-3">
                    <label className="form-label">Title *</label>
                    <input
                      className="form-control"
                      placeholder="Meeting Title"
                      name="title"
                      value={meetingFormData.title}
                      onChange={handleMeetingInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Organizer *</label>
                    <select
                      className="form-control"
                      name="user_name"
                      value={meetingFormData.user_name}
                      onChange={handleMeetingInputChange}
                    >
                      <option value="">Select User</option>
                      {users.map(u => (
                        <option key={u.id} value={u.name}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Room *</label>
                    <select
                      className="form-control"
                      name="room_id"
                      value={meetingFormData.room_id}
                      onChange={handleMeetingInputChange}
                    >
                      <option value="">Select Room</option>
                      {rooms.map((r, index) => {
                        // Handle different property names from API response
                        const roomId = r.id || r.Id || r.room_id;
                        const roomName = r.name || r.room_name || `Room ${roomId}`;
                        return (
                          <option key={`room-option-edit-${roomId || `fallback-${index}`}`} value={roomId}>
                            {roomName}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Agenda</label>
                    <textarea
                      className="form-control"
                      placeholder="Meeting Agenda"
                      name="agenda"
                      value={meetingFormData.agenda}
                      onChange={handleMeetingInputChange}
                      rows="3"
                    />
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Start Time *</label>
                      <input
                        className="form-control"
                        type="datetime-local"
                        name="start_time"
                        value={meetingFormData.start_time}
                        onChange={handleMeetingInputChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">End Time *</label>
                      <input
                        className="form-control"
                        type="datetime-local"
                        name="end_time"
                        value={meetingFormData.end_time}
                        onChange={handleMeetingInputChange}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Type</label>
                    <input
                      className="form-control"
                      placeholder="Meeting Type"
                      name="type"
                      value={meetingFormData.type}
                      onChange={handleMeetingInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Status *</label>
                    <select
                      className="form-control"
                      name="status"
                      value={meetingFormData.status}
                      onChange={handleMeetingInputChange}
                    >
                      <option value="">Select Status</option>
                      <option value="pending">Pending</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowEditMeeting(false);
                      setMeetingError("");
                      setSelectedMeeting(null);
                      setMeetingFormData({
                        user_name: "",
                        room_id: "",
                        title: "",
                        agenda: "",
                        start_time: "",
                        end_time: "",
                        type: "",
                        status: ""
                      });
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleEditMeeting}
                    disabled={meetingLoading}
                  >
                    {meetingLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showViewMeeting && selectedMeeting && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">View Meeting</h5>
                <button className="btn-close" onClick={() => { setShowViewMeeting(false); setSelectedMeeting(null); }}></button>
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <strong>Title:</strong> {selectedMeeting.title}
                </div>
                <div className="mb-2">
                  <strong>Organizer:</strong> {users.find(u => u.id === selectedMeeting.userId)?.name || 'Unknown'}
                </div>
                <div className="mb-2">
                  <strong>Room:</strong> {rooms.find(r => r.id === selectedMeeting.roomId)?.name || 'Unknown'}
                </div>
                <div className="mb-2">
                  <strong>Agenda:</strong> {selectedMeeting.agenda}
                </div>
                <div className="mb-2">
                  <strong>Start Time:</strong> {selectedMeeting.startTime ? new Date(selectedMeeting.startTime).toLocaleString() : 'N/A'}
                </div>
                <div className="mb-2">
                  <strong>End Time:</strong> {selectedMeeting.endTime ? new Date(selectedMeeting.endTime).toLocaleString() : 'N/A'}
                </div>
                <div className="mb-2">
                  <strong>Type:</strong> {selectedMeeting.type}
                </div>
                <div className="mb-2">
                  <strong>Status:</strong> <span className={`badge ${selectedMeeting.status === 'ongoing' ? 'bg-success' : selectedMeeting.status === 'pending' ? 'bg-warning' : selectedMeeting.status === 'completed' ? 'bg-primary' : selectedMeeting.status === 'cancelled' ? 'bg-danger' : selectedMeeting.status === 'scheduled' ? 'bg-info' : 'bg-secondary'}`}>{selectedMeeting.status}</span>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => { setShowViewMeeting(false); setSelectedMeeting(null); }}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditUser && (
        <div className="modal show d-block" tabIndex="-1"><div className="modal-dialog"><div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Edit User</h5><button className="btn-close" onClick={() => { setShowEditUser(false); setUserError(""); }}></button></div>
          <div className="modal-body">
            {userError && <div className="alert alert-danger">{userError}</div>}
            <input className="form-control mb-2" name="name" value={userFormData.name || ""} onChange={handleUserInputChange}/>
            <input className="form-control mb-2" name="email" value={userFormData.email || ""} onChange={handleUserInputChange}/>
            <select className="form-control mb-2" name="role_id" value={userFormData.role_id || ""} onChange={handleUserInputChange}>
              <option value="">Select Role</option>
              {availableRoles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => { setShowEditUser(false); setUserError(""); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveUser} disabled={userLoading}>
              {userLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div></div></div>
      )}

      {showAddRoom && (
        <div className="modal show d-block" tabIndex="-1"><div className="modal-dialog"><div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Add Room</h5><button className="btn-close" onClick={() => setShowAddRoom(false)}></button></div>
          <div className="modal-body">
            <input className="form-control mb-2" name="name" placeholder="Room Name" value={roomFormData.name} onChange={handleRoomInputChange}/>
            <input className="form-control mb-2" name="location" placeholder="Location" value={roomFormData.location} onChange={handleRoomInputChange}/>
            <input className="form-control mb-2" name="capacity" placeholder="Capacity" type="number" value={roomFormData.capacity} onChange={handleRoomInputChange}/>

            {/* Features selection as checkboxes */}
            <div className="mb-2">
              <label className="form-label">Features</label>
              <div>
                {availableFeatures.map((f, index) => {
                  const featureId = f?.id ?? f?.Id ?? f?.feature_id ?? index + 1; // Ensure fallback ID
                  const featureName = f?.name ?? f?.feature_name ?? `Feature ${featureId}`;
                  // Normalize featureId to number for comparison
                  const normalizedFeatureId = Number(featureId);
                  return (
                    <div key={`add-feature-${featureId}`} className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`add-feature-${featureId}`}
                        value={normalizedFeatureId}
                        checked={selectedFeatures.includes(normalizedFeatureId)}
                        onChange={(e) => toggleFeature(Number(e.target.value))}
                      />
                      <label className="form-check-label" htmlFor={`add-feature-${featureId}`}>
                        {featureName}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowAddRoom(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddRoom}>Save</button>
          </div>
        </div></div></div>
      )}

      {showEditRoom && (
        <>
          <div className="modal-backdrop show"></div>
          <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1055 }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Room</h5>
                  <button className="btn-close" onClick={() => setShowEditRoom(false)}></button>
                </div>
                <div className="modal-body">
                  <input className="form-control mb-2" name="name" placeholder="Room Name" value={roomFormData.name} onChange={handleRoomInputChange}/>
                  <input className="form-control mb-2" name="location" placeholder="Location" value={roomFormData.location} onChange={handleRoomInputChange}/>
                  <input className="form-control mb-2" name="capacity" placeholder="Capacity" type="number" value={roomFormData.capacity} onChange={handleRoomInputChange}/>

                  {/* Features selection as checkboxes */}
                  <div className="mb-2">
                    <label className="form-label">Features</label>
                    <div>
                      {availableFeatures && availableFeatures.length > 0 ? (
                        availableFeatures.map((f, index) => {
                          const featureId = f?.id ?? f?.Id ?? f?.feature_id ?? index + 1; // Ensure fallback ID
                          const featureName = f?.name ?? f?.feature_name ?? `Feature ${featureId}`;
                          // Normalize featureId to number for comparison
                          const normalizedFeatureId = Number(featureId);
                          return (
                            <div key={`edit-feature-${featureId}`} className="form-check form-check-inline">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`edit-feature-${featureId}`}
                                value={normalizedFeatureId}
                                checked={selectedFeatures.includes(normalizedFeatureId)}
                                onChange={(e) => toggleFeature(Number(e.target.value))}
                              />
                              <label className="form-check-label" htmlFor={`edit-feature-${featureId}`}>
                                {featureName}
                              </label>
                            </div>
                          );
                        })
                      ) : (
                        <p>No features available</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowEditRoom(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleSaveRoom}>Save</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showEditProfile && (
        <div className="modal show d-block" tabIndex="-1"><div className="modal-dialog"><div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Edit Profile</h5><button className="btn-close" onClick={() => setShowEditProfile(false)}></button></div>
          <div className="modal-body">
            {profileError && <div className="alert alert-danger">{profileError}</div>}
            {profileSuccess && <div className="alert alert-success">{profileSuccess}</div>}
            <input 
              className="form-control mb-2" 
              name="name" 
              placeholder="Name" 
              value={profileFormData.name} 
              onChange={handleProfileInputChange}
            />
            <input 
              className="form-control mb-2" 
              name="email" 
              placeholder="Email" 
              value={profileFormData.email} 
              onChange={handleProfileInputChange}
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={() => setShowEditProfile(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveProfile} disabled={profileLoading}>
              {profileLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div></div></div>
      )}

    </div>
  );
};

export default AdminPanel;
